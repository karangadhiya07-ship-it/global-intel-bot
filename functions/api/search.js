export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  const q = (url.searchParams.get("q") || "usa news").toLowerCase();

  const results = [
    ...newsResults(q),
    ...videoResults(q),
    ...marketResults(q),
    ...sportsResults(q),
    ...weatherResults(q)
  ];

  return json({
    status: "ok",
    source: "Global Intel Times Unified Search",
    query: q,
    count: results.length,
    results: results.slice(0, 60)
  });
}

function newsResults(q) {
  const data = [
    ["New York Renters Face Competitive Market", "new-york", "news"],
    ["White House Faces Pressure Over Spending Talks", "politics", "news"],
    ["Wall Street Watches AI Stocks", "markets", "news"],
    ["Bitcoin Traders Watch Key Levels", "bitcoin", "news"],
    ["Extreme Weather Alerts Expand Across U.S.", "weather", "news"]
  ];

  return data
    .filter(x => match(q, x))
    .map(x => item(x[0], x[1], x[2], "category.html?topic=" + x[1]));
}

function videoResults(q) {
  const data = [
    ["Breaking News Video Briefing", "video", "video"],
    ["AI Explained Video", "artificial-intelligence", "video"],
    ["Market Update Video", "markets", "video"]
  ];

  return data
    .filter(x => match(q, x))
    .map(x => item(x[0], x[1], x[2], "category.html?topic=" + x[1]));
}

function marketResults(q) {
  const data = ["AAPL", "MSFT", "NVDA", "TSLA", "BTC", "ETH", "GOLD", "SILVER"];

  return data
    .filter(x => x.toLowerCase().includes(q))
    .map(x => ({
      title: x + " Market Dashboard",
      category: "markets",
      type: "market",
      url: "market.html?symbol=" + x,
      summary: "Open live chart, AI analysis, support, resistance and watchlist."
    }));
}

function sportsResults(q) {
  const data = ["World Cup", "NBA", "NFL", "MLB", "Tennis", "Formula 1"];

  return data
    .filter(x => x.toLowerCase().includes(q))
    .map(x => item(x + " Live Scores", "sports", "sports", "category.html?topic=sports"));
}

function weatherResults(q) {
  const data = ["New York Weather", "California Weather", "Texas Weather", "Florida Weather"];

  return data
    .filter(x => x.toLowerCase().includes(q))
    .map(x => item(x, "weather", "weather", "category.html?topic=weather"));
}

function item(title, category, type, url) {
  return {
    title,
    category,
    type,
    url,
    summary: title + " updates from Global Intel Times."
  };
}

function match(q, arr) {
  return arr.join(" ").toLowerCase().includes(q);
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
