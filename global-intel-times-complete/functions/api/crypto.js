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

export async function onRequestGet({ request }) {
  const coin = (new URL(request.url).searchParams.get("coin") || "bitcoin").toLowerCase();
  const map = { btc:"bitcoin", eth:"ethereum", bitcoin:"bitcoin", ethereum:"ethereum" };
  const id = map[coin] || coin;
  try {
    const data = await safeFetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true`);
    const price = data[id]?.usd || 0;
    const change = data[id]?.usd_24h_change || 0;
    return json({ name:id, price, change:Number(change.toFixed(2)), sentiment: change >= 0 ? "Bullish momentum" : "Risk-off sentiment" });
  } catch (e) { return json({ name:id, price:0, sentiment:"Crypto unavailable" }); }
}
