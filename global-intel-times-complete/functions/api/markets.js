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

export async function onRequestGet({ request, env }) {
  const symbol = (new URL(request.url).searchParams.get("symbol") || "AAPL").toUpperCase();
  try {
    if (env.FINNHUB_API_KEY && !["BTC","ETH","GOLD"].includes(symbol)) {
      const q = await safeFetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${env.FINNHUB_API_KEY}`);
      const price = q.c || 0, prev = q.pc || price, change = prev ? ((price-prev)/prev*100) : 0;
      return json({ symbol, price, change:Number(change.toFixed(2)), support:Number((price*0.97).toFixed(2)), resistance:Number((price*1.04).toFixed(2)), trend:change>=0?"Uptrend":"Downtrend", sentiment:change>=0?"Positive":"Cautious", aiAnalysis:`${symbol} is trading with ${change>=0?"positive":"negative"} short-term momentum.` });
    }
    return json({ symbol, price:0, change:0, support:"--", resistance:"--", trend:"Neutral", sentiment:"Mixed", aiAnalysis:`Add FINNHUB_API_KEY for live ${symbol} data.` });
  } catch(e) { return json({ symbol, price:0, change:0, trend:"Neutral", sentiment:"Unavailable" }); }
}
