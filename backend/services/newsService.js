import axios from "axios";

export async function getNews(companyName) {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      throw new Error("GNEWS_API_KEY is not set in your .env file");
    }

    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: companyName,
        lang: "en",
        max: 5,
        sortby: "publishedAt",
        apikey: apiKey,
      },
    });

    const articles = response.data.articles;

    if (!articles || articles.length === 0) {
      return [];
    }

    return articles.map((article) => ({
      title: article.title,
      description: article.description || "No description available",
      url: article.url,
      source: article.source?.name || "Unknown Source",
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error("News fetch failed:", error.message);
    return [];
  }
}
