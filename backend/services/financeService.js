import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

async function getTickerSymbol(companyName) {
  const results = await yahooFinance.search(companyName);
  const equity = results.quotes.find((q) => q.quoteType === "EQUITY");

  if (!equity) {
    throw new Error(`Could not find a stock ticker for "${companyName}"`);
  }

  return equity.symbol;
}

export async function getFinancials(companyName) {
  try {
    const ticker = await getTickerSymbol(companyName);
    const quote = await yahooFinance.quote(ticker);

    let summary = {};
    try {
      summary = await yahooFinance.quoteSummary(ticker, {
        modules: ["financialData", "defaultKeyStatistics", "summaryProfile", "assetProfile"],
      });
    } catch (err) {
      console.warn(`Could not fetch full summary for ${ticker}:`, err.message);
    }

    const financialData = summary?.financialData || {};
    const keyStats = summary?.defaultKeyStatistics || {};
    const profile = summary?.summaryProfile || summary?.assetProfile || {};

    return {
      ticker,
      companyName: quote.longName || quote.shortName || companyName,
      currentPrice: quote.regularMarketPrice ?? "N/A",
      currency: quote.currency ?? "USD",
      marketCap: formatNumber(quote.marketCap),
      peRatio: financialData.trailingPE ?? keyStats.trailingPE ?? "N/A",
      forwardPE: financialData.forwardPE ?? keyStats.forwardPE ?? "N/A",
      revenueGrowth: formatPercent(financialData.revenueGrowth),
      profitMargin: formatPercent(financialData.profitMargins),
      debtToEquity: financialData.debtToEquity ?? "N/A",
      returnOnEquity: formatPercent(financialData.returnOnEquity),
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? "N/A",
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? "N/A",
      analystRecommendation: financialData.recommendationKey ?? "N/A",
      website: profile.website || "",
    };
  } catch (error) {
    throw new Error(`Finance fetch failed: ${error.message}`);
  }
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
