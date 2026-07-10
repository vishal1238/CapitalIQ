import express from "express";
import { getFinancials } from "../services/financeService.js";
import { getNews } from "../services/newsService.js";
import { getAIRecommendation } from "../services/aiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { company } = req.body;

  if (!company || typeof company !== "string" || company.trim() === "") {
    return res.status(400).json({ error: "Please provide a valid company name." });
  }

  const companyName = company.trim();

  try {
    const financials = await getFinancials(companyName);
    const news = await getNews(companyName);
    const aiResult = await getAIRecommendation(companyName, financials, news);

    const response = {
      company: financials.companyName || companyName,
      ticker: financials.ticker,
      recommendation: aiResult.recommendation,
      score: aiResult.score,
      summary: aiResult.summary,
      pros: aiResult.pros || [],
      cons: aiResult.cons || [],
      risks: aiResult.risks || [],
      website: financials.website || "",
      financials: {
        currentPrice: financials.currentPrice,
        currency: financials.currency,
        marketCap: financials.marketCap,
        peRatio: financials.peRatio,
        forwardPE: financials.forwardPE,
        revenueGrowth: financials.revenueGrowth,
        profitMargin: financials.profitMargin,
        debtToEquity: financials.debtToEquity,
        returnOnEquity: financials.returnOnEquity,
        fiftyTwoWeekHigh: financials.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: financials.fiftyTwoWeekLow,
        analystRecommendation: financials.analystRecommendation,
      },
      news,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong. Please try again.",
    });
  }
});

export default router;
