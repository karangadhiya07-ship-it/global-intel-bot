import { json, fallbackArticles, fetchJson } from './_utils.js';
import { dedupe, articleMatchesTopic } from './_rss.js';

const GROUPS = ['news-a','news-b','news-c','news-d'];

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const limit = Math.min(900, Number(url.searchParams.get('limit') || 650));
  const cacheKey = new Request(`${url.origin}/api/news-cache?topic=${encodeURIComponent(topic)}&limit=${limit}`, request);

  try {
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let articles = [], errors = [], feedCount = 0, apiCount = 0;
    const calls = await Promise.allSettled([
      ...GROUPS.map(ep => fetch(`${url.origin}/api/${ep}?topic=${encodeURIComponent(topic)}&limit=260`, { cf: { cacheTtl: 300, cacheEverything: true } }).then(r => r.json())),
      loadNewsApi(topic, env),
      loadGNews(topic, env)
    ]);

    for (const c of calls) {
      if (c.status === 'fulfilled') {
        articles.push(...(c.value.articles || []));
        feedCount += c.value.meta?.feedCount || 0;
        apiCount += c.value.meta?.apiCount || 0;
        if (c.value.error) errors.push(c.value.error);
      } else errors.push(c.reason?.message || 'news source failed');
    }

    articles = dedupe(articles)
      .filter(a => articleMatchesTopic(a, topic))
      .sort((a,b) => (Number(b.importanceScore||0)+Number(b.trendingScore||0)+Number(b.popularityScore||0)) - (Number(a.importanceScore||0)+Number(a.trendingScore||0)+Number(a.popularityScore||0)) || new Date(b.publishedAt||0)-new Date(a.publishedAt||0))
      .slice(0, limit);

    if (articles.length < 80) articles = dedupe([...articles, ...fallbackArticles(topic, Math.max(160, limit))]).slice(0, limit);
    const body = { topic, count: articles.length, articles, error: errors.length ? errors.slice(0,8).join(' | ') : undefined, meta: { version:'v8.1', target:'500+ articles', rssFeeds:feedCount, apiSources:apiCount, groupCount: GROUPS.length, cache:'cloudflare-edge', updatedAt:new Date().toISOString() } };
    const response = json(body, 200, { 'cache-control': 'public,max-age=120,s-maxage=600,stale-while-revalidate=3600' });
    await cache.put(cacheKey, response.clone());
    return response;
  } catch (e) {
    return json({ topic, count: 160, articles: fallbackArticles(topic, 160), error: e.message, meta:{version:'v8.1', fallback:true, updatedAt:new Date().toISOString()} });
  }
}

async function loadNewsApi(topic, env){
  if(!env?.NEWSAPI_KEY) return {articles:[], meta:{apiCount:0}};
  const q = encodeURIComponent(topic === 'latest' ? 'world OR business OR technology' : topic.replace(/-/g,' '));
  const data = await fetchJson(`https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=100&sortBy=publishedAt&apiKey=${env.NEWSAPI_KEY}`);
  return { articles:(data.articles||[]).map((a,i)=>normalizeApi(a,'NewsAPI',i)), meta:{apiCount:1} };
}
async function loadGNews(topic, env){
  if(!env?.GNEWS_API_KEY) return {articles:[], meta:{apiCount:0}};
  const q = encodeURIComponent(topic === 'latest' ? 'world business technology markets' : topic.replace(/-/g,' '));
  const data = await fetchJson(`https://gnews.io/api/v4/search?q=${q}&lang=en&max=100&apikey=${env.GNEWS_API_KEY}`);
  return { articles:(data.articles||[]).map((a,i)=>normalizeApi(a,'GNews',i)), meta:{apiCount:1} };
}
function normalizeApi(a, source, i){
  const title=a.title||'News Update', desc=a.description||a.content||'';
  const id=(title+'-'+source+'-'+i).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,120);
  return {id,title,description:desc,summary:desc,url:a.url||'#',image:a.urlToImage||a.image||'./assets/images/og-image.svg',publishedAt:a.publishedAt||new Date().toISOString(),source:a.source?.name||source,section:'world',topic:'world',country:'Global',tags:[],riskScore:20,importanceScore:60,trendingScore:70,popularityScore:65,sentiment:'Neutral',keyPoints:['Live API source item'],whyItMatters:'This update is included from a live news API source.'};
}
