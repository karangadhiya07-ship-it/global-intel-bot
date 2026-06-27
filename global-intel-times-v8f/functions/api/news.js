import { json, fallbackArticles } from './_utils.js';
import { dedupe, articleMatchesTopic, isBroadTopic } from './_rss.js';

const ENDPOINTS = ['news-a', 'news-b', 'news-c', 'news-d'];
const DEFAULT_LIMIT = 80;
const MAX_LIMIT = 120;
const MAX_TOTAL = 3000;

function intParam(value, fallback, min, max) {
  const n = Number.parseInt(value || '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  const topic = u.searchParams.get('topic') || 'latest';
  const origin = u.origin;
  const limit = intParam(u.searchParams.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = intParam(u.searchParams.get('offset'), 0, 0, MAX_TOTAL);

  const responses = await Promise.allSettled(
    ENDPOINTS.map(ep => fetch(`${origin}/api/${ep}?topic=${encodeURIComponent(topic)}`, {
      cf: { cacheTtl: 300, cacheEverything: true }
    }).then(r => r.ok ? r.json() : Promise.reject(new Error(`${ep} ${r.status}`))))
  );

  let articles = [];
  const errors = [];

  for (let i = 0; i < responses.length; i += 1) {
    const r = responses[i];
    const ep = ENDPOINTS[i];
    if (r.status === 'fulfilled') {
      articles.push(...(r.value.articles || []));
      if (r.value.error) errors.push(`${ep}: ${r.value.error}`);
    } else {
      errors.push(`${ep}: ${r.reason?.message || 'failed'}`);
    }
  }

  articles = dedupe(articles)
    .filter(a => isBroadTopic(topic) ? true : articleMatchesTopic(a, topic))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, MAX_TOTAL);

  const total = articles.length;
  const page = articles.slice(offset, offset + limit);
  const out = page.length ? page : (offset === 0 ? fallbackArticles(topic) : []);

  return json({
    topic,
    count: out.length,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
    nextOffset: offset + limit < total ? offset + limit : null,
    articles: out,
    error: errors.length ? errors.slice(0, 8).join(' | ') : undefined
  }, 200, {
    'Cache-Control': 'public, max-age=180, s-maxage=300, stale-while-revalidate=900'
  });
}
