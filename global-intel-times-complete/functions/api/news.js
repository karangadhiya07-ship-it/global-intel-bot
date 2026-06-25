const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=120"
  }
});
const safeFetch = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": "GlobalIntelTimes/1.0" } });
  if (!res.ok) throw new Error("Fetch failed " + res.status);
  return res.json();
};

export async function onRequestGet({ request, env }) {
  const topic = new URL(request.url).searchParams.get("topic") || "usa breaking news";
  try {
    let articles = [];
    if (env.GNEWS_API_KEY) {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&country=us&max=20&apikey=${env.GNEWS_API_KEY}`;
      const data = await safeFetch(url);
      articles = (data.articles || []).map(a => ({ title:a.title, description:a.description, content:a.content, image:a.image, url:a.url, publishedAt:a.publishedAt, author:a.source?.name, source:a.source?.url }));
    } else if (env.NEWS_API_KEY) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=20&sortBy=publishedAt&apiKey=${env.NEWS_API_KEY}`;
      const data = await safeFetch(url);
      articles = (data.articles || []).map(a => ({ title:a.title, description:a.description, content:a.content, image:a.urlToImage, url:a.url, publishedAt:a.publishedAt, author:a.author, source:a.source?.name }));
    }
    return json({ articles });
  } catch (e) {
    return json({ articles: [], error: e.message }, 200);
  }
}
