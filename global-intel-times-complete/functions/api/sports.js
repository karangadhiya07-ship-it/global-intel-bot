const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=120"
  }
});
const safeFetch = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": "GlobalIntelTimes/1.0" } });
  if (!res.ok) throw new Error("Fetch failed " + res.status);
  return res.json();
};

export async function onRequestGet() {
  return json({ scores: [
    { league:"NBA", homeTeam:"Lakers", awayTeam:"Warriors", homeScore:102, awayScore:98, status:"Live" },
    { league:"NFL", homeTeam:"Cowboys", awayTeam:"Eagles", homeScore:21, awayScore:24, status:"Final" },
    { league:"MLB", homeTeam:"Yankees", awayTeam:"Mets", homeScore:4, awayScore:2, status:"Final" }
  ]});
}
