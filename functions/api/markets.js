export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  const symbol = (url.searchParams.get("symbol") || "AAPL").toUpperCase();

  const market = buildMarketData(symbol);

  return json({
    status: "ok",
    source: "Global Intel Times Market Engine",
    market
  });
}

function buildMarketData(symbol) {
  const normalized = normalizeSymbol(symbol);

  return {
    symbol,
    tradingViewSymbol: normalized,
    price: mockPrice(symbol),
    change: mockChange(symbol),
    trend: detectTrend(symbol),
    support: mockSupport(symbol),
    resistance: mockResistance(symbol),
    sentiment: mockSentiment(symbol),
    volume: mockVolume(symbol),
    aiAnalysis: generateAIAnalysis(symbol),
    watchlist: ["AAPL", "MSFT", "NVDA", "TSLA", "META", "GOOGL", "BTC", "ETH", "GOLD", "SILVER"],
    updatedAt: new Date().toISOString()
  };
}

function normalizeSymbol(symbol) {
  const map = {
    BTC: "BINANCE:BTCUSDT",
    ETH: "BINANCE:ETHUSDT",
    GOLD: "TVC:GOLD",
    SILVER: "TVC:SILVER",
    AAPL: "NASDAQ:AAPL",
    MSFT: "NASDAQ:MSFT",
    NVDA: "NASDAQ:NVDA",
    TSLA: "NASDAQ:TSLA",
    META: "NASDAQ:META",
    GOOGL: "NASDAQ:GOOGL"
  };

  return map[symbol] || "NASDAQ:" + symbol;
}

function mockPrice(symbol) {
  const prices = {
    AAPL: 214.35,
    MSFT: 487.18,
    NVDA: 142.66,
    TSLA: 324.82,
    META: 682.44,
    GOOGL: 178.27,
    BTC: 104250,
    ETH: 3520,
    GOLD: 2358,
    SILVER: 30.4
  };

  return prices[symbol] || 100 + Math.round(Math.random() * 200);
}

function mockChange(symbol) {
  const seed = symbol.length;
  const change = ((seed * 1.37) % 5 - 2).toFixed(2);
  return Number(change);
}

function detectTrend(symbol) {
  const change = mockChange(symbol);
  if (change > 1) return "Bullish";
  if (change < -1) return "Bearish";
  return "Neutral";
}

function mockSupport(symbol) {
  const price = mockPrice(symbol);
  return Number((price * 0.94).toFixed(2));
}

function mockResistance(symbol) {
  const price = mockPrice(symbol);
  return Number((price * 1.08).toFixed(2));
}

function mockSentiment(symbol) {
  const trend = detectTrend(symbol);
  if (trend === "Bullish") return "Positive";
  if (trend === "Bearish") return "Negative";
  return "Mixed";
}

function mockVolume(symbol) {
  const base = symbol.length * 1234567;
  return base.toLocaleString("en-US");
}

function generateAIAnalysis(symbol) {
  return (
    symbol +
    " is being watched for price momentum, volume confirmation and broader market sentiment. " +
    "Traders should monitor support, resistance and news catalysts before making decisions."
  );
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
