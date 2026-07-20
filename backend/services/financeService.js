import axios from "axios";

const BASE = "https://finnhub.io/api/v1";
const TOKEN = process.env.FINNHUB_API_KEY;

async function getTickerSymbol(companyName) {
  const { data } = await axios.get(`${BASE}/search`, {
    params: { q: companyName, token: TOKEN },
  });

  const match =
    data.result?.find((r) => r.type === "Common Stock") || data.result?.[0];

  if (!match) {
    throw new Error(`Could not find a stock ticker for "${companyName}"`);
  }

  return match.symbol;
}

export async function getFinancials(companyName) {
  let ticker = "N/A";
  try {
    ticker = await getTickerSymbol(companyName);
  } catch (e) {
    console.warn("getTickerSymbol error:", e.message);
  }

  let profile = {};
  let quote = {};
  let metrics = {};
  let recommendation = "N/A";

  if (ticker !== "N/A") {
    try {
      const { data } = await axios.get(`${BASE}/stock/profile2`, {
        params: { symbol: ticker, token: TOKEN },
      });
      profile = data || {};
    } catch (e) {
      console.warn("profile2 error:", e.message);
    }

    try {
      const { data } = await axios.get(`${BASE}/quote`, {
        params: { symbol: ticker, token: TOKEN },
      });
      quote = data || {};
    } catch (e) {
      console.warn("quote error:", e.message);
    }

    try {
      const { data } = await axios.get(`${BASE}/stock/metric`, {
        params: { symbol: ticker, metric: "all", token: TOKEN },
      });
      metrics = data?.metric || {};
    } catch (e) {
      console.warn("metrics error:", e.message);
    }

    try {
      const { data } = await axios.get(`${BASE}/stock/recommendation`, {
        params: { symbol: ticker, token: TOKEN },
      });
      if (Array.isArray(data) && data.length > 0) {
        recommendation = deriveRecommendation(data[0]);
      }
    } catch (e) {
      console.warn("recommendation error:", e.message);
    }
  }

  const rawMarketCap = profile.marketCapitalization
    ? profile.marketCapitalization * 1e6
    : null;

  return {
    ticker,
    companyName: profile.name || companyName,
    currentPrice: quote.c ?? "N/A",
    currency: profile.currency || "USD",
    marketCap: formatNumber(rawMarketCap),
    peRatio: safe(metrics.peExclExtraTTM ?? metrics.peTTM),
    forwardPE: safe(metrics.forwardPE),
    revenueGrowth: formatPercent(
      metrics.revenueGrowthTTMYoy != null
        ? metrics.revenueGrowthTTMYoy / 100
        : undefined
    ),
    profitMargin: formatPercent(
      metrics.netProfitMarginTTM != null
        ? metrics.netProfitMarginTTM / 100
        : undefined
    ),
    debtToEquity: safe(
      metrics.totalDebtToEquityQuarterly ??
        metrics.totalDebtToEquityAnnual ??
        metrics.longTermDebtToEquityQuarterly
    ),
    returnOnEquity: formatPercent(
      metrics.roeTTM != null ? metrics.roeTTM / 100 : undefined
    ),
    fiftyTwoWeekHigh: safe(metrics["52WeekHigh"]),
    fiftyTwoWeekLow: safe(metrics["52WeekLow"]),
    analystRecommendation: recommendation,
    website: profile.weburl || "",
  };
}

function safe(val) {
  if (val === undefined || val === null || isNaN(val)) return "N/A";
  return val;
}

function deriveRecommendation({
  strongBuy = 0,
  buy = 0,
  hold = 0,
  sell = 0,
  strongSell = 0,
}) {
  const sum = strongBuy + buy + hold + sell + strongSell;
  if (sum === 0) return "N/A";

  const counts = { strongBuy, buy, hold, sell, strongSell };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const labels = {
    strongBuy: "strong_buy",
    buy: "buy",
    hold: "hold",
    sell: "sell",
    strongSell: "strong_sell",
  };
  return labels[best[0]] || "N/A";
}

function formatNumber(num) {
  if (!num || isNaN(num)) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num}`;
}

function formatPercent(val) {
  if (val === undefined || val === null || isNaN(val)) return "N/A";
  return `${(val * 100).toFixed(2)}%`;
}
