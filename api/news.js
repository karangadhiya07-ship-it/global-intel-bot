export default async function handler(req, res) {
  const query = req.query.q || "global news";

  const data = [
    {
      title: `Latest updates for ${query}`,
      category: "Global News",
      risk: "Medium",
      source: "News API Placeholder",
      link: "#"
    },
    {
      title: `Breaking intelligence report about ${query}`,
      category: "Global News",
      risk: "High",
      source: "News API Placeholder",
      link: "#"
    }
  ];

  res.status(200).json({
    success: true,
    query,
    items: data
  });
}
