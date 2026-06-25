const fallbackArticles = [
  {
    title: "White House Faces New Economic Pressure",
    description: "US policymakers continue discussions around inflation, jobs and economic growth.",
    section: "U.S.",
    source: "Global Intel Times",
    url: "#",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Nvidia And Microsoft Lead AI Market Expansion",
    description: "Artificial intelligence investments continue driving major technology companies higher.",
    section: "Technology",
    source: "Global Intel Times",
    url: "#",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Bitcoin Traders Watch Key Resistance Levels",
    description: "Crypto investors remain focused on market liquidity and institutional demand.",
    section: "Crypto",
    source: "Global Intel Times",
    url: "#",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200",
    publishedAt: new Date().toISOString()
  }
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
  "celebrity gossip",
  "movie star",
  "lottery"
];

function cleanText(text = "") {
  return String(text || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isBlocked(article) {
  const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();
  return blockedWords.some(word => text.includes(word));
}

function scoreArticle(article) {
  const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();

  let score = 0;

  const priority = [
    "white house",
    "congress",
    "us politics",
    "u.s.",
    "economy",
    "inflation",
    "stock market",
    "wall street",
    "federal reserve",
    "ai",
    "artificial intelligence",
    "nvidia",
    "microsoft",
    "apple",
    "bitcoin",
    "crypto",
    "world affairs"
  ];

  priority.forEach(word => {
    if (text.includes(word)) score += 10;
  });

  if (article.image || article.image_url) score += 5;
  if (article.publishedAt || article.pubDate || article.published_at) score += 3;

  return score;
}

function normalizeArticle(item) {
  return {
    title: cleanText(item.title),
    description: cleanText(
      item.description ||
      item.content ||
      item.summary ||
      "This story is developing and more updates may follow soon."
    ),
    source:
      item.source_id ||
      item.source ||
      item.source_name ||
      "News",
    url:
      item.url ||
      item.link ||
      "#",
    image:
      item.image_url ||
      item.image ||
      item.imageUrl ||
      "",
    publishedAt:
      item.publishedAt ||
      item.pubDate ||
      item.published_at ||
      new Date().toISOString()
  };
}

async function safeFetch(url) {
  try {
    const controller = new AbortController();

    setTimeout(() => {
      controller.abort();
    }, 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) return [];

    const data = await response.json();

    if (Array.isArray(data.articles)) return data.articles;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.news)) return data.news;

    return [];
  } catch (error) {
    return [];
  }
}

exports.handler = async function (event) {
  const q = event.queryStringParameters?.q || "usa breaking news politics economy ai stock market";

  const GNEWS_KEY = process.env.GNEWS_KEY;
  const NEWSDATA_KEY = process.env.NEWSDATA_KEY;
  const THENEWSAPI_KEY = process.env.THENEWSAPI_KEY;
  const MEDIASTACK_KEY = process.env.MEDIASTACK_KEY;
  const CURRENTS_KEY = process.env.CURRENTS_KEY;

  const urls = [];

  if (GNEWS_KEY) {
    urls.push(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&country=us&max=30&apikey=${GNEWS_KEY}`
    );
  }

  if (NEWSDATA_KEY) {
    urls.push(
      `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_KEY}&q=${encodeURIComponent(q)}&country=us&language=en`
    );
  }

  if (THENEWSAPI_KEY) {
    urls.push(
      `https://api.thenewsapi.com/v1/news/all?api_token=${THENEWSAPI_KEY}&search=${encodeURIComponent(q)}&language=en&locale=us&limit=30`
    );
  }

  if (MEDIASTACK_KEY) {
    urls.push(
      `https://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&keywords=${encodeURIComponent(q)}&countries=us&languages=en&limit=30`
    );
  }

  if (CURRENTS_KEY) {
    urls.push(
      `https://api.currentsapi.services/v1/search?apiKey=${CURRENTS_KEY}&keywords=${encodeURIComponent(q)}&language=en&country=US`
    );
  }

  let all = [];

  const responses = await Promise.all(urls.map(url => safeFetch(url)));

  responses.forEach(list => {
    all = all.concat(list);
  });

  let normalized = all
    .map(normalizeArticle)
    .filter(article => article.title)
    .filter(article => !isBlocked(article));

  const seen = new Set();

  normalized = normalized.filter(article => {
    const key = article.title.toLowerCase().trim();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });

  normalized = normalized
    .map(article => ({
      ...article,
      score: scoreArticle(article)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  if (!normalized.length) {
    normalized = fallbackArticles;
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=120"
    },
    body: JSON.stringify({
      success: true,
      total: normalized.length,
      results: normalized
    })
  };
};
