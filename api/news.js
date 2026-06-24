export default async function handler(req, res) {
  const q = req.query.q || "breaking news";

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&country=us&max=25&apikey=${process.env.GNEWS_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        results: [],
        error: data.errors || "GNews API Error"
      });
    }

    const results = (data.articles || []).map(article => ({
      title: article.title || "",
      description: article.description || "",
      content: article.content || "",
      image_url: article.image || "",
      link: article.url || "#",
      source_id: article.source?.name || "GNews"
    }));

    return res.status(200).json({
      results,
      totalResults: results.length
    });

  } catch (error) {
    console.error("GNEWS ERROR:", error);

    return res.status(500).json({
      results: [],
      error: error.message
    });
  }
}
