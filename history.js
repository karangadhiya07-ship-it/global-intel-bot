export default async function handler(req, res) {
  const symbol = (req.query.symbol || "AAPL").toUpperCase();

  const FINNHUB_KEY =
    process.env.FINNHUB_API_KEY ||
    process.env.FINNHUB_API_key ||
    process.env.FINNHUB_KEY;

  if (!FINNHUB_KEY) {
    return res.status(200).json({
      success: false,
      message: "Missing Finnhub API key",
      symbol,
      candles: []
    });
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60;

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${ninetyDaysAgo}&to=${now}&token=${FINNHUB_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.s !== "ok") {
      return res.status(200).json({
        success: false,
        symbol,
        candles: [],
        message: "No chart data found"
      });
    }

    const candles = data.t.map((time, index) => ({
      date: new Date(time * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      }),
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index]
    }));

    return res.status(200).json({
      success: true,
      symbol,
      candles
    });

  } catch (error) {
    return res.status(200).json({
      success: false,
      symbol,
      candles: [],
      error: error.message
    });
  }
}
