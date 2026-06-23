export default async function handler(req, res) {
  const q = req.query.q || "world";

  const url =
    `https://newsdata.io/api/1/latest?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(q)}&language=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch news"
    });
  }
}
