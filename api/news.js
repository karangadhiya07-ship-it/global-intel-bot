export default async function handler(req, res) {
  const q = req.query.q || "bitcoin";

  const topics = [
    q,
    `${q} latest news`,
    `${q} market`,
    "artificial intelligence",
    "stock market",
    "technology news",
    "business news"
  ];

  const clean = (text = "") =>
    String(text).replace(/\s+/g, " ").trim();

  const normalize = (article) => ({
    title: clean(article.title),
    description: clean(article.description || article.snippet || article.content),
    content: clean(article.content || article.description || article.snippet),
    image_url: article.image_url || article.image || article.urlToImage || "",
    link: article.link || article.url || "#",
    source_id: article.source_id || article.source?.name || article.source || "News"
  });

  function isGoodArticle(item) {
    const badText = "ONLY AVAILABLE IN PAID PLANS";

    return (
      item.title &&
      item.description &&
      !item.title.includes(badText) &&
      !item.description.includes(badText) &&
      !(item.content || "").includes(badText)
    );
  }

  async function tryGNews(topic) {
    if (!process.env.GNEWS_API_KEY) return [];

    const url =
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}` +
      `&lang=en&country=us&max=30&apikey=${process.env.GNEWS_API_KEY}`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.errors) return [];
    return (data.articles || []).map(normalize);
  }

  async function tryNewsData(topic) {
    if (!process.env.NEWSDATA_API_KEY) return [];

    const url =
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}` +
      `&q=${encodeURIComponent(topic)}&language=en`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.status === "error") return [];
    return (data.results || []).map(normalize);
  }

  async function tryTheNewsAPI(topic) {
    if (!process.env.THENEWS_API_KEY) return [];

    const url =
      `https://api.thenewsapi.com/v1/news/all?api_token=${process.env.THENEWS_API_KEY}` +
      `&search=${encodeURIComponent(topic)}&language=en&limit=30`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.error) return [];
    return (data.data || []).map(normalize);
  }

  async function tryMediastack(topic) {
    if (!process.env.MEDIASTACK_API_KEY) return [];

    const url =
      `https://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_API_KEY}` +
      `&keywords=${encodeURIComponent(topic)}&languages=en&limit=30`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.error) return [];
    return (data.data || []).map(normalize);
  }

  async function tryCurrents(topic) {
    if (!process.env.CURRENTS_API_KEY) return [];

    const url =
      `https://api.currentsapi.services/v1/search?apiKey=${process.env.CURRENTS_API_KEY}` +
      `&keywords=${encodeURIComponent(topic)}&language=en`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.status === "error") return [];

    return (data.news || []).map(article => normalize({
      title: article.title,
      description: article.description,
      content: article.description,
      image_url: article.image,
      link: article.url,
      source_id: article.author || "CurrentsAPI"
    }));
  }

  const providers = [
    ["GNews", tryGNews],
    ["NewsData", tryNewsData],
    ["TheNewsAPI", tryTheNewsAPI],
    ["Mediastack", tryMediastack],
    ["CurrentsAPI", tryCurrents]
  ];

  const finalResults = [];
  const seen = new Set();
  const usedProviders = [];

  for (const [provider, fn] of providers) {
    for (const topic of topics) {
      try {
        const results = await fn(topic);

        results
          .filter(isGoodArticle)
          .forEach(item => {
            const key = item.title.toLowerCase();

            if (!seen.has(key) && finalResults.length < 30) {
              seen.add(key);
              finalResults.push(item);
            }
          });

        if (results.length > 0 && !usedProviders.includes(provider)) {
          usedProviders.push(provider);
        }

        if (finalResults.length >= 30) break;

      } catch (e) {
        console.log(provider + " failed:", e.message);
      }
    }

    if (finalResults.length >= 30) break;
  }

  if (finalResults.length > 0) {
    return res.status(200).json({
      provider: usedProviders.join(" + ") || "MultiAPI",
      totalResults: finalResults.length,
      results: finalResults
    });
  }

  return res.status(200).json({
    provider: "StaticFallback",
    totalResults: 3,
    results: [
      {
        title: "Global markets remain active as investors track technology, crypto and economic signals",
        description: "Markets continue reacting to business updates, technology developments and global indicators.",
        content: "Fallback story shown when live APIs are unavailable.",
        image_url: "",
        link: "#",
        source_id: "Global Intel Times"
      },
      {
        title: "Technology and AI remain major focus areas for global businesses",
        description: "Companies continue investing in artificial intelligence, automation and digital infrastructure.",
        content: "Fallback story shown when live APIs are unavailable.",
        image_url: "",
        link: "#",
        source_id: "Global Intel Times"
      },
      {
        title: "Crypto market watchers follow Bitcoin and digital asset trends",
        description: "Crypto investors monitor Bitcoin, regulation, ETFs and institutional activity.",
        content: "Fallback story shown when live APIs are unavailable.",
        image_url: "",
        link: "#",
        source_id: "Global Intel Times"
      }
    ]
  });
}
