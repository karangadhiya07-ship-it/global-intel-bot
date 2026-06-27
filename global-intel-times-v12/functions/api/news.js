import { json, fallbackArticles } from './_utils.js';
import { dedupe, articleMatchesTopic, cleanText, slug } from './_rss.js';

const ENDPOINTS = ['news-a','news-b','news-c','news-d'];

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const limit = Math.min(Number(url.searchParams.get('limit') || 500), 900);
  const page = Math.max(Number(url.searchParams.get('page') || 1), 1);
  const since = url.searchParams.get('since');
  const origin = url.origin;
  const errors = [];
  let articles = [];

  const apiArticles = await loadApiArticles(topic, env, errors);
  articles.push(...apiArticles);

  const results = await Promise.allSettled(ENDPOINTS.map(ep => fetch(`${origin}/api/${ep}?topic=${encodeURIComponent(topic)}`, { cf:{ cacheTtl: 180, cacheEverything: true } }).then(r => r.json())));
  for (const r of results) {
    if (r.status === 'fulfilled') {
      articles.push(...(r.value.articles || []));
      if (r.value.error) errors.push(r.value.error);
    } else errors.push(r.reason?.message || 'source group failed');
  }

  articles = dedupe([...(await loadArchive(env)), ...articles])
    .filter(a => articleMatchesTopic(a, topic))
    .sort((a,b) => (Number(b.importance || 0) - Number(a.importance || 0)) || (new Date(b.publishedAt||0) - new Date(a.publishedAt||0)));

  await saveArchive(env, articles);

  if (since) articles = articles.filter(a => new Date(a.publishedAt||0) > new Date(since));

  const total = articles.length;
  const start = (page - 1) * limit;
  const sliced = since ? articles.slice(0, 60) : articles.slice(start, start + limit);
  const out = sliced.length ? sliced : fallbackArticles(topic).map(a => ({...a, image:'/assets/images/placeholder-news.svg'}));

  return json({
    topic,
    page,
    limit,
    total,
    count: out.length,
    hasMore: start + limit < total,
    nextPage: start + limit < total ? page + 1 : null,
    generatedAt: new Date().toISOString(),
    articles: out,
    error: errors.length ? errors.slice(0,8).join(' | ') : undefined
  }, { 'Cache-Control':'public, max-age=60, s-maxage=240' });
}

async function loadArchive(env) {
  const kv = env?.ARTICLES_KV || env?.NEWS_ARCHIVE || env?.GIT_ARCHIVE;
  if (!kv?.get) return [];
  try { return JSON.parse(await kv.get('articles:v8') || '[]'); } catch { return []; }
}
async function saveArchive(env, articles) {
  const kv = env?.ARTICLES_KV || env?.NEWS_ARCHIVE || env?.GIT_ARCHIVE;
  if (!kv?.put) return;
  try { await kv.put('articles:v8', JSON.stringify(articles.slice(0, 8000)), { expirationTtl: 60 * 60 * 24 * 30 }); } catch {}
}

async function loadApiArticles(topic, env, errors) {
  const jobs = [];
  if (env?.GNEWS_API_KEY) jobs.push(loadGNews(topic, env.GNEWS_API_KEY).catch(e => (errors.push('GNews '+e.message), [])));
  if (env?.NEWS_API_KEY) jobs.push(loadNewsApi(topic, env.NEWS_API_KEY).catch(e => (errors.push('NewsAPI '+e.message), [])));
  const groups = await Promise.all(jobs);
  return groups.flat();
}
async function loadGNews(topic, key) {
  const q = encodeURIComponent(topic === 'latest' ? 'breaking news OR world OR markets' : topic);
  const res = await fetch(`https://gnews.io/api/v4/search?q=${q}&lang=en&max=50&apikey=${key}`, { cf:{ cacheTtl:300, cacheEverything:true }});
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  return (data.articles || []).map(a => normalizeApiArticle(a, a.source?.name || 'GNews'));
}
async function loadNewsApi(topic, key) {
  const q = encodeURIComponent(topic === 'latest' ? 'breaking news OR world OR markets' : topic);
  const res = await fetch(`https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=100&sortBy=publishedAt&apiKey=${key}`, { cf:{ cacheTtl:300, cacheEverything:true }});
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  return (data.articles || []).map(a => normalizeApiArticle(a, a.source?.name || 'NewsAPI'));
}
function normalizeApiArticle(a, source) {
  const title = cleanText(a.title || 'News Update');
  const description = cleanText(a.description || a.content || 'This story is developing.');
  return {
    id: slug(`${title}-${source}`), title, description, summary: description, content: description,
    source, author: a.author || source, url: a.url || '#', image: a.image || a.urlToImage || '/assets/images/placeholder-news.svg',
    publishedAt: a.publishedAt || new Date().toISOString(), section: 'latest', topic: 'latest', category: 'latest', tags: [], riskLevel: 'Low', riskScore: 10, importance: 70, trendingScore: 60, country: 'Global'
  };
}
