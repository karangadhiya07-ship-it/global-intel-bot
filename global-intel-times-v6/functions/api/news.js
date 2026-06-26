import { json, fallbackArticles, fetchJson } from './_utils.js';
import { dedupe, articleMatchesTopic } from './_rss.js';

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const topic = u.searchParams.get('topic') || 'usa';
  const origin = u.origin;
  let articles = [];
  let errors = [];

  for (const endpoint of ['news-a','news-b','news-c','news-d']) {
    try {
      const d = await fetch(`${origin}/api/${endpoint}?topic=${encodeURIComponent(topic)}`, { cf:{cacheTtl:300,cacheEverything:true} }).then(r=>r.json());
      articles.push(...(d.articles || []));
      if (d.error) errors.push(`${endpoint}: ${d.error}`);
    } catch(e) {
      errors.push(`${endpoint}: ${e.message}`);
    }
  }

  if (env.NEWS_API_KEY && articles.length < 80) {
    try {
      const d = await fetchJson(`https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=50&sortBy=publishedAt&apiKey=${env.NEWS_API_KEY}`);
      articles.push(...(d.articles || []).map(a => ({
        title:a.title, description:a.description, content:a.content || a.description,
        author:a.author || a.source?.name || 'NewsAPI', image:a.urlToImage || '',
        publishedAt:a.publishedAt, url:a.url, section:'latest', topic:'latest'
      })));
    } catch(e) { errors.push('NewsAPI: '+e.message); }
  }

  articles = dedupe(articles)
    .filter(a => topic === 'latest' || topic === 'usa' ? true : articleMatchesTopic(a, topic))
    .sort((a,b)=>new Date(b.publishedAt||0)-new Date(a.publishedAt||0))
    .slice(0,260);

  return json({
    topic,
    count: articles.length,
    articles: articles.length ? articles : fallbackArticles(topic),
    error: errors.length ? errors.slice(0,10).join(' | ') : undefined
  });
}
