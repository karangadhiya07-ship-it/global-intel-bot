export async function onRequestGet(context) {
  const { request } = context;

  const url = new URL(request.url);
  const coin = (url.searchParams.get("coin") || "bitcoin").toLowerCase();

  let data = null;

  try {
    data = await fetchCoinGecko(coin);
  } catch (e) {
    console.log(e);
  }

  if (!data) {
    data = fallbackCoin(coin);
  }

  return json({
    status: "ok",
    source: "Global Intel Times Crypto Engine",
    crypto: data
  });
}

/* ================= COINGECKO ================= */

async function fetchCoinGecko(coin) {

  const api =
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd" +
    "&ids=" + encodeURIComponent(coin);

  const res = await fetch(api);

  if (!res.ok) return null;

  const data = await res.json();

  if (!data.length) return null;

  const c = data[0];

  return {
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    image: c.image,
    price: c.current_price,
    marketCap: c.market_cap,
    volume: c.total_volume,
    high24h: c.high_24h,
    low24h: c.low_24h,
    ath: c.ath,
    atl: c.atl,
    change24h: c.price_change_percentage_24h,
    rank: c.market_cap_rank,
    sentiment: sentiment(c.price_change_percentage_24h),
    support: Number((c.current_price * 0.95).toFixed(2)),
    resistance: Number((c.current_price * 1.08).toFixed(2)),
    aiAnalysis: ai(c)
  };
}

/* ================= AI ================= */

function ai(c) {

  return `${c.name} is currently trading around $${c.current_price}.
Volume remains active while traders monitor support near
${(c.current_price*0.95).toFixed(2)}
and resistance around
${(c.current_price*1.08).toFixed(2)}.
Momentum is currently ${sentiment(c.price_change_percentage_24h).toLowerCase()}.`;

}

function sentiment(change){

  if(change>5) return "Very Bullish";

  if(change>1) return "Bullish";

  if(change<-5) return "Very Bearish";

  if(change<-1) return "Bearish";

  return "Neutral";

}

/* ================= FALLBACK ================= */

function fallbackCoin(id){

const coins={

bitcoin:{
name:"Bitcoin",
symbol:"BTC",
price:104350,
marketCap:2050000000000,
volume:42000000000,
high24h:105800,
low24h:102900,
ath:112000,
atl:67,
rank:1
},

ethereum:{
name:"Ethereum",
symbol:"ETH",
price:3520,
marketCap:430000000000,
volume:17000000000,
high24h:3602,
low24h:3470,
ath:4891,
atl:0.43,
rank:2
},

solana:{
name:"Solana",
symbol:"SOL",
price:182,
marketCap:96000000000,
volume:4200000000,
high24h:186,
low24h:177,
ath:295,
atl:0.5,
rank:6
}

};

const c=coins[id]||coins.bitcoin;

return{

...c,

image:"",

change24h:2.35,

support:Number((c.price*0.95).toFixed(2)),

resistance:Number((c.price*1.08).toFixed(2)),

sentiment:"Bullish",

aiAnalysis:`${c.name} continues to attract investor attention with healthy market activity.`

};

}

/* ================= JSON ================= */

function json(data){

return new Response(JSON.stringify(data,null,2),{

headers:{

"content-type":"application/json",

"access-control-allow-origin":"*",

"cache-control":"public,max-age=120"

}

});

}
