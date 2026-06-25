export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  const topic = url.searchParams.get("topic") || "markets";
  const symbol = (url.searchParams.get("symbol") || "AAPL").toUpperCase();

  const history = buildHistory(topic, symbol);

  return json({
    status: "ok",
    source: "Global Intel Times History Engine",
    topic,
    symbol,
    history
  });
}

function buildHistory(topic, symbol) {
  const now = Date.now();
  const data = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const base = mockBase(symbol);
    const move = Math.sin(i / 3) * 4 + (i % 5);

    data.push({
      date: date.toISOString().slice(0, 10),
      symbol,
      topic,
      open: Number((base + move - 1.2).toFixed(2)),
      high: Number((base + move + 2.4).toFixed(2)),
      low: Number((base + move - 3.1).toFixed(2)),
      close: Number((base + move).toFixed(2)),
      volume: Math.round(1000000 + i * 45231)
    });
  }

  return data;
}

function mockBase(symbol) {
  const prices = {
    AAPL: 214,
    MSFT: 487,
    NVDA: 142,
    TSLA: 324,
    META: 682,
    GOOGL: 178,
    BTC: 104250,
    ETH: 3520,
    GOLD: 2358,
    SILVER: 30
  };

  return prices[symbol] || 100;
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
