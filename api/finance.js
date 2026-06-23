export default async function handler(req, res) {
  const data = {
    marketStatus: "Monitoring",
    riskLevel: "Medium",
    indicators: [
      "Stock market movement",
      "Federal Reserve signals",
      "Inflation update",
      "Oil price watch"
    ]
  };

  res.status(200).json({
    success: true,
    finance: data
  });
}
