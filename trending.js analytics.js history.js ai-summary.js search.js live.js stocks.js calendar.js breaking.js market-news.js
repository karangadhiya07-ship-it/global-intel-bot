export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  const topic = url.searchParams.get("topic") || "usa";

  const trending = buildTrending(topic);

  return json({
    status: "ok",
    source: "Global Intel Times Trending Engine",
    topic,
    trending
  });
}

function buildTrending(topic) {
  const base = [
    trend("Breaking News", 96, "High reader interest"),
    trend("U.S. Politics", 91, "Washington updates moving fast"),
    trend("Stock Market", 88, "Markets reacting to economic data"),
    trend("Artificial Intelligence", 86, "AI companies and regulation in focus"),
    trend("Weather Alerts", 83, "Storms and heat alerts active"),
    trend("Bitcoin", 79, "Crypto volatility rising"),
    trend("New York", 77, "Local housing and city news trending"),
    trend("Sports Live Scores", 74, "World Cup and U.S. sports updates")
  ];

  return base.map((item, index) => ({
    ...item,
    rank: index + 1,
    topic,
    updatedAt: new Date().toISOString()
  }));
}

function trend(name, score, reason) {
  return {
    id: slugify(name),
    name,
    score,
    reason,
    status: score > 90 ? "Hot" : score > 80 ? "Rising" : "Active"
  };
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=120"
    }
  });
}
