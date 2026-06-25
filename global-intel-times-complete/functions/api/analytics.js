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
  return json({ visitorsToday: 125000 + Math.floor(Math.random()*5000), liveAudience: 1000 + Math.floor(Math.random()*900), scores: { trending:92, ai:88, market:84, crypto:79, politics:86, technology:89, weather:81, sports:76 } });
}
