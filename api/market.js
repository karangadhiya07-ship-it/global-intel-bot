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
      quote: null
    });
  }

  try {
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`;
    const metricUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`;
    const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2026-01-01&to=2026-12-31&token=${FINNHUB_KEY}`;

    const [quoteRes, profileRes, metricRes, newsRes] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl),
      fetch(metricUrl),
      fetch(newsUrl)
    ]);

    const quote = await quoteRes.json();
    const profile = await profileRes.json();
    const metricData = await metricRes.json();
    const news = await newsRes.json();

    const metric = metricData.metric || {};

    const price = quote.c || 0;
    const change = quote.d || 0;
    const percent = quote.dp || 0;

    let signal = "Neutral";
    if (percent > 2) signal = "Strong Bullish";
    else if (percent > 0.5) signal = "Bullish";
    else if (percent < -2) signal = "Strong Bearish";
    else if (percent < -0.5) signal = "Bearish";

    const analysis = `${symbol} is currently trading around $${price}. The stock is showing ${signal.toLowerCase()} momentum with a daily move of ${percent.toFixed(
      2
    )}%. Investors are watching price action, volume, earnings strength, valuation, and broader market sentiment.`;

    return res.status(200).json({
      success: true,
      symbol,
      quote: {
        price,
        change,
        percent,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        previousClose: quote.pc
      },
      profile: {
        name: profile.name || symbol,
        ticker: profile.ticker || symbol,
        exchange: profile.exchange || "",
        industry: profile.finnhubIndustry || "",
        logo: profile.logo || "",
        weburl: profile.weburl || "",
        marketCapitalization: profile.marketCapitalization || null
      },
      metrics: {
        peRatio: metric.peNormalizedAnnual || metric.peBasicExclExtraTTM || "N/A",
        eps: metric.epsNormalizedAnnual || metric.epsBasicExclExtraItemsTTM || "N/A",
        week52High: metric["52WeekHigh"] || "N/A",
        week52Low: metric["52WeekLow"] || "N/A",
        dividendYield: metric.dividendYieldIndicatedAnnual || "N/A"
      },
      signal,
      analysis,
      news: Array.isArray(news)
        ? news.slice(0, 6).map(item => ({
            title: item.headline,
            summary: item.summary,
            url: item.url,
            image: item.image,
            source: item.source,
            datetime: item.datetime
          }))
        : []
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      symbol,
      message: "Market API failed",
      error: error.message
    });
  }
}
