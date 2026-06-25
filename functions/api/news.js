export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "usa breaking news";
  const topic = url.searchParams.get("topic") || query;

  const NEWS_API_KEY = env.NEWS_API_KEY || "";
  const GNEWS_API_KEY = env.GNEWS_API_KEY || "";

  const topics = buildTopicPool(topic);

  let articles = [];

  try {
    if (GNEWS_API_KEY) {
      const gnews = await fetchGNews(topics, GNEWS_API_KEY);
      articles.push(...gnews);
    }

    if (NEWS_API_KEY) {
      const newsapi = await fetchNewsAPI(topics, NEWS_API_KEY);
      articles.push(...newsapi);
    }
  } catch (err) {
    console.log("News API error:", err.message);
  }

  articles = normalizeArticles(articles);
  articles = filterBadArticles(articles);
  articles = removeDuplicates(articles);

  if (articles.length < 30) {
    articles.push(...fallbackArticles(topic));
  }

  articles = removeDuplicates(articles).slice(0, 80);

  return json({
    status: "ok",
    source: "Global Intel Times News Engine",
    count: articles.length,
    topic,
    articles
  });
}

/* ================= SOURCES ================= */

async function fetchGNews(topics, key) {
  const all = [];

  for (const topic of topics.slice(0, 8)) {
    const url =
      "https://gnews.io/api/v4/search?q=" +
      encodeURIComponent(topic) +
      "&lang=en&country=us&max=10&apikey=" +
      key;

    const res = await fetch(url);
    if (!res.ok) continue;

    const data = await res.json();
    const items = data.articles || [];

    all.push(
      ...items.map(item => ({
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.url,
        image: item.image,
        publishedAt: item.publishedAt,
        source: item.source?.name,
        apiSource: "GNews"
      }))
    );
  }

  return all;
}

async function fetchNewsAPI(topics, key) {
  const all = [];

  for (const topic of topics.slice(0, 6)) {
    const url =
      "https://newsapi.org/v2/everything?q=" +
      encodeURIComponent(topic) +
      "&language=en&sortBy=publishedAt&pageSize=10&apiKey=" +
      key;

    const res = await fetch(url);
    if (!res.ok) continue;

    const data = await res.json();
    const items = data.articles || [];

    all.push(
      ...items.map(item => ({
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.url,
        image: item.urlToImage,
        publishedAt: item.publishedAt,
        source: item.source?.name,
        apiSource: "NewsAPI"
      }))
    );
  }

  return all;
}

/* ================= TOPIC ENGINE ================= */

function buildTopicPool(topic) {
  const base = [
    topic,
    "usa breaking news",
    "u.s. politics",
    "white house",
    "congress",
    "supreme court",
    "new york news",
    "california news",
    "texas news",
    "florida news",
    "world news",
    "middle east news",
    "russia ukraine war",
    "china news",
    "business news",
    "stock market news",
    "wall street",
    "economy news",
    "inflation news",
    "technology news",
    "artificial intelligence news",
    "openai news",
    "cybersecurity news",
    "bitcoin news",
    "crypto news",
    "weather alerts usa",
    "climate change news",
    "health news",
    "science news",
    "sports news",
    "nba news",
    "nfl news",
    "mlb news",
    "soccer news",
    "formula 1 news",
    "tennis news",
    "culture news",
    "movie news",
    "music news",
    "lifestyle news",
    "travel news",
    "food news"
  ];

  return [...new Set(base)];
}

/* ================= NORMALIZE ================= */

function normalizeArticles(items) {
  return items
    .map((item, index) => {
      const title = cleanText(item.title || "");
      const summary = cleanText(item.description || item.content || "");
      const category = detectCategory(title + " " + summary);

      return {
        id: slugify(title || "news-" + index),
        title,
        summary,
        content: cleanText(item.content || item.description || summary),
        category,
        section: titleCase(category),
        image: item.image || fallbackImage(category),
        source: item.source || item.apiSource || "News Source",
        sourceUrl: item.url || "#",
        publishedAt: item.publishedAt || new Date().toISOString(),
        readingTime: readingTime(summary),
        trendingScore: scoreArticle(title, summary),
        apiSource: item.apiSource || "Fallback"
      };
    })
    .filter(a => a.title && a.title.length > 15);
}

/* ================= FILTERS ================= */

function filterBadArticles(articles) {
  const blocked = [
    "casino",
    "betting",
    "odds",
    "sportsbook",
    "promo code",
    "coupon",
    "discount code",
    "sponsored",
    "affiliate",
    "adult",
    "porn",
    "gambling",
    "lottery",
    "buy now",
    "deal of the day"
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
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ================= CATEGORY ================= */

function detectCategory(text) {
  const t = text.toLowerCase();

  if (has(t, ["new york", "nyc", "manhattan", "brooklyn"])) return "new-york";
  if (has(t, ["trump", "biden", "white house", "congress", "senate", "election"])) return "politics";
  if (has(t, ["stock", "nasdaq", "dow", "s&p", "wall street", "market"])) return "markets";
  if (has(t, ["bitcoin", "crypto", "ethereum", "btc"])) return "bitcoin";
  if (has(t, ["artificial intelligence", "openai", "chatgpt", "ai"])) return "artificial-intelligence";
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
  return words.some(w => text.includes(w));
}

/* ================= FALLBACK ================= */

function fallbackArticles(topic) {
  const base = [
    ["New York Renters Face a Competitive Housing Market", "new-york"],
    ["White House Faces Pressure Over Spending Talks", "politics"],
    ["Wall Street Watches AI Stocks as Investors Reassess Growth", "markets"],
    ["Bitcoin Traders Watch Key Levels After Volatile Week", "bitcoin"],
    ["Artificial Intelligence Rules Push Companies to Review Risk", "artificial-intelligence"],
    ["Extreme Weather Alerts Expand Across Major U.S. Cities", "weather"],
    ["Global Economy Faces Mixed Signals From Trade and Inflation", "world"],
    ["Cybersecurity Teams Warn Small Businesses About Attacks", "technology"],
    ["NBA Offseason Moves Reset Expectations for Contenders", "sports"],
    ["Scientists Track Climate Signals Across the Atlantic", "science"],
    ["Hospitals Expand Digital Tools to Improve Patient Care", "health"],
    ["Culture Weekend: Movies, Music and Theater Openings", "culture"],
    ["Business Leaders Prepare for New Economic Data", "business"]
  ];

  const out = [];

  for (let i = 0; i < 60; i++) {
    const item = base[i % base.length];
    out.push({
      id: slugify(item[0] + "-" + i),
      title: item[0],
      summary: "Latest updates, context and analysis from Global Intel Times.",
      content: "This developing story includes background, analysis and related updates.",
      category: item[1],
      section: titleCase(item[1]),
      image: fallbackImage(item[1]),
      source: "Global Intel Times",
      sourceUrl: "#",
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      readingTime: 3,
      trendingScore: 70 - (i % 20),
      apiSource: "Fallback"
    });
  }

  return out;
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
      "cache-control": "public, max-age=300"
    }
  });
}
