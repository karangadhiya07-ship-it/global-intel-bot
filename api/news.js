export default async function handler(req, res) {
  const q = req.query.q || "bitcoin";

  async function tryGNews() {
    if (!process.env.GNEWS_API_KEY) return [];

    const url =
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}` +
      `&lang=en&country=us&max=10&apikey=${process.env.GNEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.errors) return [];

    return (data.articles || []).map(article => ({
      title: article.title || "",
      description: article.description || "",
      content: article.content || "",
      image_url: article.image || "",
      link: article.url || "#",
      source_id: article.source?.name || "GNews"
    }));
  }

  async function tryNewsData() {
    if (!process.env.NEWSDATA_API_KEY) return [];

    const url =
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}` +
      `&q=${encodeURIComponent(q)}&language=en`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status === "error") return [];

    return (data.results || []).map(article => ({
      title: article.title || "",
      description: article.description || "",
      content: article.content || "",
      image_url: article.image_url || "",
      link: article.link || "#",
      source_id: article.source_id || "NewsData"
    }));
  }

  async function tryTheNewsAPI() {
    if (!process.env.THENEWSAPI_KEY) return [];

    const url =
      `https://api.thenewsapi.com/v1/news/all?api_token=${process.env.THENEWSAPI_KEY}` +
      `&search=${encodeURIComponent(q)}&language=en&limit=10`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) return [];

    return (data.data || []).map(article => ({
      title: article.title || "",
      description: article.description || article.snippet || "",
      content: article.snippet || article.description || "",
      image_url: article.image_url || "",
      link: article.url || "#",
      source_id: article.source || "TheNewsAPI"
    }));
  }

  const fallbackStatic = [
    {
      title: "Global markets remain active as investors track technology, crypto and economic signals",
      description: "Markets continue to react to business updates, technology developments and global economic indicators.",
      content: "This is a fallback story shown when live APIs are temporarily unavailable.",
      image_url: "",
      link: "#",
      source_id: "Global Intel Times"
    },
    {
      title: "Technology and AI remain major focus areas for global businesses",
      description: "Companies continue to invest in artificial intelligence, automation and digital infrastructure.",
      content: "This is a fallback story shown when live APIs are temporarily unavailable.",
      image_url: "",
      link: "#",
      source_id: "Global Intel Times"
    },
    {
      title: "Crypto market watchers follow Bitcoin and digital asset trends",
      description: "Crypto investors continue to monitor Bitcoin, regulation, ETFs and institutional activity.",
      content: "This is a fallback story shown when live APIs are temporarily unavailable.",
      image_url: "",
      link: "#",
      source_id: "Global Intel Times"
    }
  ];

  try {
    let results = [];

    results = await tryGNews();
    if (results.length > 0) {
      return res.status(200).json({
        provider: "GNews",
        results
      });
    }

    results = await tryNewsData();
    if (results.length > 0) {
      return res.status(200).json({
        provider: "NewsData",
        results
      });
    }

    results = await tryTheNewsAPI();
    if (results.length > 0) {
      return res.status(200).json({
        provider: "TheNewsAPI",
        results
      });
    }

    return res.status(200).json({
      provider: "StaticFallback",
      results: fallbackStatic
    });

  } catch (error) {
    return res.status(200).json({
      provider: "StaticFallback",
      results: fallbackStatic,
      error: error.message
    });
  }
}
