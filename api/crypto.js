export default async function handler(req, res) {
  const data = {
    bitcoin: "Monitoring",
    marketRisk: "High",
    alerts: [
      "Bitcoin volatility watch",
      "Crypto ETF updates",
      "Major whale movement watch"
    ]
  };

  res.status(200).json({
    success: true,
    crypto: data
  });
}
