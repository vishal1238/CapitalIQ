import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function getAIRecommendation(companyName, financials, news) {
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
  });

  const systemPrompt = `You are a professional investment analyst. 
Your job is to analyze company financial data and recent news, then provide a clear investment recommendation.

You MUST respond with ONLY valid JSON — no explanation, no markdown, no extra text.
The JSON must follow this exact structure:
{
  "recommendation": "Invest" or "Pass",
  "score": <number from 0 to 10>,
  "summary": "<2-3 sentence overview of your analysis>",
  "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
  "cons": ["<con 1>", "<con 2>"],
  "risks": ["<risk 1>", "<risk 2>"]
}`;

  const newsText =
    news.length > 0
      ? news.map((n, i) => `${i + 1}. ${n.title} (${n.source})`).join("\n")
      : "No recent news available.";

  const financialsText = Object.entries(financials)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const userPrompt = `Analyze the following company and provide an investment recommendation.

Company: ${companyName}

=== FINANCIAL DATA ===
${financialsText}

=== LATEST NEWS ===
${newsText}

Based on this data, should an investor BUY (Invest) or AVOID (Pass) this stock?
Respond with ONLY the JSON object as specified.`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const rawText = response.content;

    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.recommendation || parsed.score === undefined) {
      throw new Error("AI response is missing required fields");
    }

    return parsed;
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}
