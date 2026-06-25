export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const topic = url.searchParams.get("topic") || url.searchParams.get("q") || "usa breaking news";

  const NEWS_API_KEY = env.NEWS_API_KEY || "";
  const GNEWS_API_KEY = env.GNEWS_API_KEY || "";

  let articles = [];

  const topics = buildTopicPool(topic);

  try {
    if (GNEWS_API_KEY) {
      const gnews = await fetchGNews(topics, GNEWS_API_KEY);
      articles.push(...gnews);
    }
  } catch (err) {
    console.log("GNews error:", err.message);
  }

  try {
    if (NEWS_API_KEY) {
      const newsapi = await fetchNewsAPI(topics, NEWS_API_KEY);
      articles.push(...newsapi);
    }
  } catch (err) {
    console.log("NewsAPI error:", err.message);
  }

  articles = normalizeArticles(articles);
  articles = filterBadArticles(articles);
  articles = removeDuplicates(articles);
  articles = sortLatest(articles);

  const liveCount = articles.length;

  if (articles.length === 0) {
    articles = fallbackArticles(topic);
  }

  articles = articles.slice(0, 100);

  return json({
    status: "ok",
    source: "Global Intel Times News Engine V2",
    topic,
    count: articles.length,
    liveCount,
    fallbackUsed: liveCount === 0,
    debug: {
      hasNewsAPI: Boolean(NEWS_API_KEY),
      hasGNewsAPI: Boolean(GNEWS_API_KEY),
      firstApiSource: articles[0]?.apiSource || "none"
    },
    articles
  });
}

/* ================= GNEWS ================= */

async function fetchGNews(topics, key) {
  const all = [];

  for (const topic of topics.slice(0, 6)) {
    const api =
      "https://gnews.io/api/v4/search" +
      "?q=" + encodeURIComponent(topic) +
      "&lang=en" +
      "&country=us" +
      "&max=10" +
      "&apikey=" + key;

    const res = await fetch(api);
    if (!res.ok) {
      console.log("GNews failed:", res.status, topic);
      continue;
    }

    const data = await res.json();
    const items = data.articles || [];

    for (const item of items) {
      all.push({
        title: item.title,
        summary: item.description,
        content: item.content || item.description,
        image: item.image,
        source: item.source?.name || "GNews",
        sourceUrl: item.url,
        publishedAt: item.publishedAt,
        apiSource: "GNews"
      });
    }
  }

  return all;
}

/* ================= NEWS API ================= */

async function fetchNewsAPI(topics, key) {
  const all = [];

  for (const topic of topics.slice(0, 5)) {
    const api =
      "https://newsapi.org/v2/everything" +
      "?q=" + encodeURIComponent(topic) +
      "&language=en" +
      "&sortBy=publishedAt" +
      "&pageSize=10" +
      "&apiKey=" + key;

    const res = await fetch(api);
    if (!res.ok) {
      console.log("NewsAPI failed:", res.status, topic);
      continue;
    }

    const data = await res.json();
    const items = data.articles || [];

    for (const item of items) {
      all.push({
        title: item.title,
        summary: item.description,
        content: item.content || item.description,
        image: item.urlToImage,
        source: item.source?.name || "NewsAPI",
        sourceUrl: item.url,
        publishedAt: item.publishedAt,
        apiSource: "NewsAPI"
      });
    }
  }

  return all;
}

/* ================= TOPIC POOL ================= */

function buildTopicPool(topic) {
  const clean = String(topic || "").replace(/-/g, " ");

  const pool = [
    clean,
    "usa breaking news",
    "us politics",
    "white house",
    "congress",
    "supreme court",
    "new york news",
    "california news",
    "world news",
    "business news",
    "stock market news",
    "wall street",
    "technology news",
    "artificial intelligence news",
    "bitcoin news",
    "weather alerts usa",
    "sports news",
    "health news",
    "science news",
    "culture news"
  ];

  return [...new Set(pool.filter(Boolean))];
}

/* ================= NORMALIZE ================= */

function normalizeArticles(items) {
  return items
    .map((item, index) => {
      const title = cleanText(item.title);
      const summary = cleanText(item.summary || item.content);
      const category = detectCategory(title + " " + summary);

      return {
        id: slugify(title || "article-" + index),
        title,
        summary: summary || "Latest update from Global Intel Times.",
        content: cleanText(item.content || summary),
        category,
        section: titleCase(category),
        image: item.image || fallbackImage(category),
        source: item.source || "News Source",
        sourceUrl: item.sourceUrl || "#",
        publishedAt: item.publishedAt || new Date().toISOString(),
        readingTime: readingTime(item.content || summary),
        trendingScore: scoreArticle(title, summary),
        apiSource: item.apiSource || "Live"
      };
    })
    .filter(a => {
      if (!a.title || a.title.length < 18) return false;
      if (a.title.toLowerCase().includes("[removed]")) return false;
      return true;
    });
}

/* ================= FILTERS ================= */

function filterBadArticles(articles) {
  const blocked = [
    "casino",
    "betting",
    "sportsbook",
    "odds",
    "coupon",
    "promo code",
    "discount code",
    "sponsored",
    "affiliate",
    "adult",
    "porn",
    "gambling",
    "lottery",
    "deal of the day",
    "buy now"
  ];

  return articles.filter(article => {
    const text = (article.title + " " + article.summary).toLowerCase();
    return !blocked.some(word => text.includes(word));
  });
}

function removeDuplicates(articles) {
  const seen = new Set();

  return articles.filter(article => {
    const key = slugify(article.title).slice(0, 90);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortLatest(articles) {
  return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

/* ================= CATEGORY ================= */

function detectCategory(text) {
  const t = String(text || "").toLowerCase();

  if (has(t, ["new york", "nyc", "manhattan", "brooklyn"])) return "new-york";
  if (has(t, ["trump", "biden", "white house", "congress", "senate", "election"])) return "politics";
  if (has(t, ["stock", "nasdaq", "dow", "s&p", "wall street", "market"])) return "markets";
  if (has(t, ["bitcoin", "crypto", "ethereum", "btc"])) return "bitcoin";
  if (has(t, ["artificial intelligence", "openai", "chatgpt", " ai "])) return "artificial-intelligence";
  if (has(t, ["technology", "cybersecurity", "software", "startup"])) return "technology";
  if (has(t, ["weather", "storm", "heat", "flood", "hurricane", "climate"])) return "weather";
  if (has(t, ["nba", "nfl", "mlb", "soccer", "tennis", "formula 1", "world cup"])) return "sports";
  if (has(t, ["health", "hospital", "doctor", "medical", "virus"])) return "health";
  if (has(t, ["science", "space", "research", "nasa"])) return "science";
  if (has(t, ["movie", "music", "arts", "culture", "theater"])) return "culture";
  if (has(t, ["world", "china", "russia", "ukraine", "europe", "middle east"])) return "world";
  if (has(t, ["business", "economy", "inflation", "jobs", "bank"])) return "business";

  return "us";
}

function has(text, words) {
  return words.some(word => text.includes(word));
}

/* ================= FALLBACK ONLY IF LIVE FAILS ================= */

function fallbackArticles(topic) {
  const base = [
    ["U.S. Officials Monitor Breaking Developments Across Major Cities", "us"],
    ["White House Faces Pressure as Congress Debates New Spending Plan", "politics"],
    ["Wall Street Watches Technology Shares as Market Momentum Shifts", "markets"],
    ["Bitcoin Traders Watch Key Levels After Crypto Market Volatility", "bitcoin"],
    ["Artificial Intelligence Companies Prepare for New Compliance Rules", "artificial-intelligence"],
    ["Extreme Weather Alerts Expand Across Major U.S. Regions", "weather"],
    ["Global Leaders Weigh Diplomacy as Regional Tensions Continue", "world"],
    ["Cybersecurity Experts Warn Companies About Rising Online Threats", "technology"],
    ["Sports Fans Track Live Scores Across Major U.S. Leagues", "sports"],
    ["Health Systems Expand Digital Tools to Improve Patient Care", "health"],
    ["Scientists Track New Climate Signals Across the Atlantic", "science"],
    ["Culture Weekend Brings New Movies, Music and Theater Openings", "culture"],
    ["Business Leaders Prepare for Fresh Economic Data", "business"]
  ];

  return base.map((item, index) => {
    const category = item[1];

    return {
      id: slugify(item[0] + "-" + index),
      title: item[0],
      summary: "Fallback story shown only when live news APIs return no usable articles.",
      content: "This page is using fallback content because all live news providers failed or returned no usable articles.",
      category,
      section: titleCase(category),
      image: fallbackImage(category),
      source: "Global Intel Times",
      sourceUrl: "#",
      publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
      readingTime: 3,
      trendingScore: 50,
      apiSource: "Fallback"
    };
  });
}

function fallbackImage(category) {
  const images = {
    "new-york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
    politics: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=1200",
    markets: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200",
    bitcoin: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=1200",
    "artificial-intelligence": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
    weather: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
    world: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200",
    technology: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
    sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
    health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200",
    science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200",
    culture: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
    business: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200",
    us: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200"
  };

  return images[category] || images.us;
}

/* ================= HELPERS ================= */

function cleanText(text) {
  return String(text || "")
    .replace(/\[\+\d+ chars\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(text) {
  return String(text || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function readingTime(text) {
  const words = String(text || "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

function scoreArticle(title, summary) {
  const t = (title + " " + summary).toLowerCase();
  let score = 50;

  ["breaking", "live", "urgent", "market", "ai", "weather", "election", "new york"].forEach(w => {
    if (t.includes(w)) score += 8;
  });

  return Math.min(100, score);
}

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=180"
    }
  });
}
