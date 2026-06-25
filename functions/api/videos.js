export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "usa breaking news";
  const topic = url.searchParams.get("topic") || q;

  const YOUTUBE_API_KEY = env.YOUTUBE_API_KEY || "";

  let videos = [];

  try {
    if (YOUTUBE_API_KEY) {
      videos = await fetchYouTubeVideos(topic, YOUTUBE_API_KEY);
    }
  } catch (err) {
    console.log("YouTube API error:", err.message);
  }

  if (!videos.length) {
    videos = fallbackVideos(topic);
  }

  videos = removeDuplicates(videos).slice(0, 30);

  return json({
    status: "ok",
    source: "Global Intel Times Video Engine",
    topic,
    count: videos.length,
    videos
  });
}

/* ================= YOUTUBE ================= */

async function fetchYouTubeVideos(topic, key) {
  const queries = buildVideoQueries(topic);
  const all = [];

  for (const q of queries.slice(0, 5)) {
    const api =
      "https://www.googleapis.com/youtube/v3/search" +
      "?part=snippet" +
      "&type=video" +
      "&maxResults=8" +
      "&order=date" +
      "&safeSearch=strict" +
      "&regionCode=US" +
      "&relevanceLanguage=en" +
      "&q=" + encodeURIComponent(q) +
      "&key=" + key;

    const res = await fetch(api);
    if (!res.ok) continue;

    const data = await res.json();

    const items = data.items || [];

    all.push(
      ...items.map(item => ({
        id: item.id?.videoId || slugify(item.snippet?.title),
        videoId: item.id?.videoId,
        title: cleanText(item.snippet?.title),
        summary: cleanText(item.snippet?.description),
        channel: item.snippet?.channelTitle || "YouTube",
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          fallbackThumb(topic),
        url: item.id?.videoId
          ? "https://www.youtube.com/watch?v=" + item.id.videoId
          : "#",
        embedUrl: item.id?.videoId
          ? "https://www.youtube.com/embed/" + item.id.videoId
          : "",
        category: detectCategory(topic + " " + item.snippet?.title),
        duration: "Video",
        source: "YouTube"
      }))
    );
  }

  return filterBadVideos(all);
}

/* ================= QUERY ENGINE ================= */

function buildVideoQueries(topic) {
  return [
    topic,
    topic + " news today",
    "usa breaking news video",
    "new york news video",
    "us politics video",
    "stock market news video",
    "artificial intelligence news video",
    "technology news video",
    "weather news usa video",
    "sports news usa video",
    "world news video"
  ];
}

/* ================= FILTER ================= */

function filterBadVideos(videos) {
  const blocked = [
    "casino",
    "betting",
    "odds",
    "promo code",
    "coupon",
    "adult",
    "gambling",
    "lottery",
    "sponsored"
  ];

  return videos.filter(v => {
    const text = (v.title + " " + v.summary).toLowerCase();
    return !blocked.some(word => text.includes(word));
  });
}

function removeDuplicates(videos) {
  const seen = new Set();

  return videos.filter(v => {
    const key = v.videoId || slugify(v.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ================= FALLBACK ================= */

function fallbackVideos(topic) {
  const data = [
    ["Breaking News Briefing: Latest U.S. Updates", "usa"],
    ["Markets Today: Stocks, Economy and Wall Street", "markets"],
    ["AI Explained: The Technology Reshaping Business", "artificial-intelligence"],
    ["Weather Watch: Major U.S. City Forecasts", "weather"],
    ["World Briefing: Global Affairs and Diplomacy", "world"],
    ["New York Today: City News and Local Updates", "new-york"],
    ["Politics Video: Washington and Congress Updates", "politics"],
    ["Sports Briefing: Scores, Fixtures and Analysis", "sports"],
    ["Technology Report: Cybersecurity and Startups", "technology"],
    ["Culture Watch: Movies, Music and Entertainment", "culture"]
  ];

  return data.map((item, index) => ({
    id: slugify(item[0]),
    videoId: "",
    title: item[0],
    summary: "Video coverage and visual explanation from Global Intel Times.",
    channel: "Global Intel Times",
    publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
    thumbnail: fallbackThumb(item[1]),
    url: "#",
    embedUrl: "",
    category: item[1],
    duration: "3:00",
    source: "Fallback"
  }));
}

function fallbackThumb(category) {
  const images = {
    usa: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=900",
    politics: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=900",
    markets: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900",
    "artificial-intelligence": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900",
    weather: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
    world: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=900",
    "new-york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900",
    sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900",
    technology: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900",
    culture: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900"
  };

  return images[category] || images.usa;
}

/* ================= CATEGORY ================= */

function detectCategory(text) {
  const t = String(text || "").toLowerCase();

  if (t.includes("new york") || t.includes("nyc")) return "new-york";
  if (t.includes("politics") || t.includes("white house") || t.includes("congress")) return "politics";
  if (t.includes("market") || t.includes("stock") || t.includes("wall street")) return "markets";
  if (t.includes("ai") || t.includes("artificial intelligence") || t.includes("openai")) return "artificial-intelligence";
  if (t.includes("weather") || t.includes("storm") || t.includes("climate")) return "weather";
  if (t.includes("sports") || t.includes("nba") || t.includes("nfl") || t.includes("world cup")) return "sports";
  if (t.includes("technology") || t.includes("tech") || t.includes("cyber")) return "technology";
  if (t.includes("world") || t.includes("global") || t.includes("middle east")) return "world";
  if (t.includes("culture") || t.includes("movie") || t.includes("music")) return "culture";

  return "usa";
}

/* ================= HELPERS ================= */

function cleanText(text) {
  return String(text || "")
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

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300"
    }
  });
}
