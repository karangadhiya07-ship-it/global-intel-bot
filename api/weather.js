export default async function handler(req, res) {
  const city = req.query.city || "New York";

  const data = {
    city,
    alert: "No major alert",
    riskLevel: "Low",
    watch: [
      "Rain updates",
      "Storm alerts",
      "Temperature changes"
    ]
  };

  res.status(200).json({
    success: true,
    weather: data
  });
}
