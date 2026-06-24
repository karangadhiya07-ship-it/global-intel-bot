export default async function handler(req, res) {
  const q = req.query.q || "usa breaking news";

  const topics = [
    q,
    "usa breaking news",
    "us politics",
    "white house",
    "stock market news",
    "business news",
    "technology news",
    "artificial intelligence news",
    "new york news",
    "world news"
  ];

  const blockedWords = [
    "prediction",
    "betting",
    "odds",
    "casino",
    "promo code",
    "coupon",
    "gaming controller",
    "deal",
    "buy now",
    "singer",
    "celebrity",
    "movie",
    "tv show",
    "concert",
    "horoscope",
    "lottery",
    "recipe",
    "tips and bets"
  ];

  const priorityWords = [
    "trump",
    "white house",
    "congress",
    "senate",
    "supreme court",
    "federal",
    "election",
    "economy",
    "inflation",
    "stock",
    "market",
    "fed",
    "ai",
    "artificial intelligence",
    "technology",
    "nvidia",
    "microsoft",
    "apple",
    "bitcoin",
    "crypto",
    "new york",
    "weather",
    "storm",
    "world"
  ];

  const clean = (text = "") =>
    String(text)
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

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
    const text = `${item.title} ${item.description} ${item.content}`.toLowerCase();

    if (!item.title || !item.description) return false;
    if (item.title.includes(badText)) return false;
    if (item.description.includes(badText)) return false;
    if ((item.content || "").includes(badText)) return false;

    if (blockedWords.some(word => text.includes(word))) return false;

    if (item.title.length < 35) return false;
    if (item.description.length < 45) return false;

    return true;
  }

  function scoreArticle(item) {
    const text = `${item.title} ${item.description}`.toLowerCase();

    let score = 0;

    priorityWords.forEach(word => {
      if (text.includes(word)) score += 10;
    });

    if (text.includes("breaking")) score += 8;
    if (text.includes("live")) score += 6;
    if (text.includes("us") || text.includes("america") || text.includes("united states")) score += 8;
    if (item.image_url) score += 4;

    if (text.includes("sports")) score -= 8;
    if (text.includes("music")) score -= 10;
    if (text.includes("entertainment")) score -= 10;

    return score;
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
      `&q=${encodeURIComponent(topic)}&language=en&country=us`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.status === "error") return [];
    return (data.results || []).map(normalize);
  }

  async function tryTheNewsAPI(topic) {
    if (!process.env.THENEWS_API_KEY) return [];

    const url =
      `https://api.thenewsapi.com/v1/news/all?api_token=${process.env.THENEWS_API_KEY}` +
      `&search=${encodeURIComponent(topic)}&language=en&locale=us&limit=30`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.error) return [];
    return (data.data || []).map(normalize);
  }

  async function tryMediastack(topic) {
    if (!process.env.MEDIASTACK_API_KEY) return [];

    const url =
      `https://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_API_KEY}` +
      `&keywords=${encodeURIComponent(topic)}&languages=en&countries=us&limit=30`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data.error) return [];
    return (data.data || []).map(normalize);
  }

  async function tryCurrents(topic) {
    if (!process.env.CURRENTS_API_KEY) return [];

    const url =
      `https://api.currentsapi.services/v1/search?apiKey=${process.env.CURRENTS_API_KEY}` +
      `&keywords=${encodeURIComponent(topic)}&language=en&country=US`;

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

  const collected = [];
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

            if (!seen.has(key)) {
              seen.add(key);
              collected.push({
                ...item,
                score: scoreArticle(item)
              });
            }
          });

        if (results.length > 0 && !usedProviders.includes(provider)) {
          usedProviders.push(provider);
        }

      } catch (e) {
        console.log(provider + " failed:", e.message);
      }
    }
  }

  const finalResults = collected
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(({ score, ...item }) => item);

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
        title: "U.S. markets remain active as investors track technology and economic signals",
        description: "Markets continue reacting to business updates, technology developments and economic indicators across the United States.",
        content: "Fallback story shown when live APIs are unavailable.",
        image_url: "",
        link: "#",
        source_id: "Global Intel Times"
      },
      {
        title: "Artificial intelligence remains a major focus for U.S. technology companies",
        description: "Companies continue investing in artificial intelligence, automation and digital infrastructure as competition grows.",
        content: "Fallback story shown when live APIs are unavailable.",
        image_url: "",
        link: "#",
        source_id: "Global Intel Times"
      },
      {
        title: "New York business leaders monitor economy, housing and market trends",
        description: "New York remains a major center for finance, real estate, technology and national business developments.",
        content: "Fallback story shown when live APIs are unavailable.",
        image_url: "",
        link: "#",
        source_id: "Global Intel Times"
      }
    ]
  });
}
