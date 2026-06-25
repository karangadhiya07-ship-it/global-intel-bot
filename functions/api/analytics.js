export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  const topic = url.searchParams.get("topic") || "usa";

  const analytics = buildAnalytics(topic);

  return json({
    status: "ok",
    source: "Global Intel Times Analytics Engine",
    topic,
    analytics
  });
}

function buildAnalytics(topic) {
  return {
    topic,
    updatedAt: new Date().toISOString(),
    scores: [
      score("Trending Score", 92, "Very High"),
      score("AI Score", 88, "Rising"),
      score("Market Score", 84, "Active"),
      score("Crypto Score", 78, "Volatile"),
      score("Politics Score", 86, "High"),
      score("Technology Score", 89, "Strong"),
      score("Weather Score", 81, "Alert"),
      score("Sports Score", 74, "Active")
    ],
    insights: [
      "Reader interest is strongest around breaking news, politics and markets.",
      "AI and technology topics continue to show strong momentum.",
      "Weather and sports traffic may spike during live events.",
      "Market and crypto interest changes quickly during U.S. trading hours."
    ]
  };
}

function score(name, value, label) {
  return {
    id: slugify(name),
    name,
    value,
    label,
    trend: value >= 85 ? "up" : value >= 75 ? "stable" : "mixed"
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
