export default async function handler(req, res) {

  const q = req.query.q || "breaking news";

  try {

    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(q)}&language=en`
    );

    const data = await response.json();

    const results = (data.results || []).map(article => ({
      title: article.title || "",
      description: article.description || "",
      content: article.content || "",
      image_url: article.image_url || "",
      link: article.link || "#",
      source_id: article.source_id || "NewsData"
    }));

    return res.status(200).json({
      results
    });

  } catch(error){

    return res.status(500).json({
      results: [],
      error: error.message
    });

  }

}
