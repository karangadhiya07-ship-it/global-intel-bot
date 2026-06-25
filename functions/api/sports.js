export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const sport = url.searchParams.get("sport") || "soccer";
  const league = url.searchParams.get("league") || "world-cup";

  const SPORTS_API_KEY = env.SPORTS_API_KEY || "";

  let scores = [];

  try {
    if (SPORTS_API_KEY) {
      scores = await fetchSportsAPI(sport, league, SPORTS_API_KEY);
    }
  } catch (err) {
    console.log("Sports API error:", err.message);
  }

  if (!scores.length) scores = fallbackScores();

  return json({
    status: "ok",
    source: "Global Intel Times Sports Engine",
    sport,
    league,
    count: scores.length,
    scores
  });
}

async function fetchSportsAPI(sport, league, key) {
  const api =
    "https://v3.football.api-sports.io/fixtures?live=all";

  const res = await fetch(api, {
    headers: {
      "x-apisports-key": key
    }
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.response || [];

  return items.map(item => ({
    id: item.fixture?.id,
    league: item.league?.name || "Football",
    country: item.league?.country || "",
    status: item.fixture?.status?.long || "Scheduled",
    elapsed: item.fixture?.status?.elapsed || null,
    homeTeam: item.teams?.home?.name || "Home",
    awayTeam: item.teams?.away?.name || "Away",
    homeLogo: item.teams?.home?.logo || "",
    awayLogo: item.teams?.away?.logo || "",
    homeScore: item.goals?.home ?? 0,
    awayScore: item.goals?.away ?? 0,
    date: item.fixture?.date || new Date().toISOString()
  }));
}

function fallbackScores() {
  return [
    score("World Cup", "Germany", "Ecuador", 0, 0, "Scheduled", "4:00 PM ET"),
    score("World Cup", "Ivory Coast", "Curacao", 1, 1, "Live", "61’"),
    score("World Cup", "Netherlands", "Tunisia", 2, 0, "Live", "73’"),
    score("World Cup", "Sweden", "Japan", 0, 0, "Scheduled", "7:00 PM ET"),
    score("World Cup", "United States", "Turkey", 1, 1, "Scheduled", "10:00 PM ET"),
    score("NBA", "Lakers", "Warriors", 102, 98, "Final", "Final"),
    score("NFL", "Cowboys", "Eagles", 21, 24, "Final", "Final"),
    score("MLB", "Yankees", "Red Sox", 4, 2, "Final", "Final"),
    score("Tennis", "Player A", "Player B", 2, 1, "Live", "Set 3"),
    score("Formula 1", "Qualifying", "Race Weekend", 0, 0, "Scheduled", "Tomorrow")
  ];
}

function score(league, home, away, h, a, status, time) {
  return {
    id: slugify(league + "-" + home + "-" + away),
    league,
    homeTeam: home,
    awayTeam: away,
    homeScore: h,
    awayScore: a,
    status,
    elapsed: time,
    date: new Date().toISOString()
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
