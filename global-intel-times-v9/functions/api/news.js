import { json, fallbackArticles } from './_utils.js';
import { dedupe, articleMatchesTopic } from './_rss.js';

const CACHE_KEY = 'git:v8:articles';
const CACHE_META_KEY = 'git:v8:articles:meta';
const MAX_STORED = 5000;
const LIVE_REFRESH_MS = 60 * 1000;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const topic = cleanTopic(url.searchParams.get('topic') || 'latest');
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(60, Math.max(10, Number(url.searchParams.get('limit') || 30)));
  const since = url.searchParams.get('since');
  const id = url.searchParams.get('id');
  const force = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === '1';
  const origin = url.origin;

  const store = getStore(env);
  let saved = await readSaved(store);
  let meta = await readMeta(store);
  let errors = [];

  const isStale = !meta.updatedAt || (Date.now() - Number(meta.updatedAt)) > LIVE_REFRESH_MS;
  if (force || !saved.length || isStale) {
    try {
      const live = await loadLiveArticles(origin, topic);
      saved = mergeArticles(live, saved).slice(0, MAX_STORED);
      meta = { updatedAt: Date.now(), total: saved.length, source: store ? 'persistent-cache' : 'live-cache' };
      await writeSaved(store, saved, meta);
    } catch (e) {
      errors.push(e.message || 'refresh failed');
    }
  }

  if (!saved.length) saved = fallbackArticles(topic);

  if (id) {
    const article = saved.find(a => a.id === id || slug(a.title) === id);
    return json({ article: article || null, count: article ? 1 : 0, cache: meta, error: errors[0] });
  }

  let filtered = topic === 'latest' || topic === 'usa' || topic === 'us'
    ? saved
    : saved.filter(a => articleMatchesTopic(a, topic) || a.topic === topic || a.section === topic);

  if (since) {
    const ts = new Date(since).getTime();
    filtered = filtered.filter(a => new Date(a.publishedAt || a.createdAt || 0).getTime() > ts);
  }

  const start = (page - 1) * limit;
  const articles = filtered.slice(start, start + limit);
  return json({
    topic,
    page,
    limit,
    count: articles.length,
    total: filtered.length,
    hasMore: start + limit < filtered.length,
    lastUpdated: meta.updatedAt ? new Date(Number(meta.updatedAt)).toISOString() : new Date().toISOString(),
    cache: meta,
    articles,
    error: errors.length ? errors.slice(0, 5).join(' | ') : undefined
  });
}

async function loadLiveArticles(origin, topic) {
  const endpoints = ['news-a', 'news-b', 'news-c', 'news-d'];
  const calls = await Promise.allSettled(endpoints.map(ep =>
    fetch(`${origin}/api/${ep}?topic=${encodeURIComponent(topic)}`, {
      cf: { cacheTtl: 60, cacheEverything: true },
      headers: { 'user-agent': 'GlobalIntelTimes/8.0' }
    }).then(r => r.ok ? r.json() : Promise.reject(new Error(`${ep} ${r.status}`)))
  ));
  let articles = [];
  const errors = [];
  for (const r of calls) {
    if (r.status === 'fulfilled') articles.push(...(r.value.articles || []));
    else errors.push(r.reason?.message || 'endpoint failed');
  }
  if (!articles.length && errors.length) throw new Error(errors.join(' | '));
  return normalizeServerArticles(articles);
}

function normalizeServerArticles(list) {
  return dedupe(list.map((a, i) => {
    const title = stripHTML(a.title || `News Update ${i + 1}`);
    const summary = stripHTML(a.description || a.summary || a.content || 'Latest update from Global Intel Times.');
    const publishedAt = validDate(a.publishedAt || a.pubDate || a.date || new Date().toISOString());
    return {
      id: slug(a.id || title),
      title,
      description: summary,
      summary,
      content: stripHTML(a.content || a.description || summary),
      author: stripHTML(a.author || 'Global Intel Desk'),
      image: cleanImage(a.image || a.urlToImage || a.thumbnail, title),
      publishedAt,
      createdAt: a.createdAt || new Date().toISOString(),
      url: a.url || a.sourceUrl || '#',
      source: stripHTML(a.source || host(a.url || '')),
      section: cleanTopic(a.section || a.topic || detectTopic(`${title} ${summary}`)),
      topic: cleanTopic(a.topic || a.section || detectTopic(`${title} ${summary}`)),
      riskLevel: a.riskLevel || riskLevel(`${title} ${summary}`),
      importance: Number(a.importance || scoreImportance(`${title} ${summary}`)),
      tags: Array.isArray(a.tags) ? a.tags.slice(0, 8) : tags(`${title} ${summary}`)
    };
  })).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function mergeArticles(live, old) {
  const map = new Map();
  [...live, ...old].forEach(a => {
    const key = slug(a.url && a.url !== '#' ? a.url : a.title).slice(0, 150);
    if (!map.has(key)) map.set(key, a);
  });
  return [...map.values()].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
}

function getStore(env) {
  return env?.ARTICLES_KV || env?.NEWS_KV || env?.GIT_NEWS_KV || null;
}
async function readSaved(store) {
  if (!store?.get) return [];
  try {
    const raw = await store.get(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
async function readMeta(store) {
  if (!store?.get) return {};
  try {
    const raw = await store.get(CACHE_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
async function writeSaved(store, articles, meta) {
  if (!store?.put) return;
  await store.put(CACHE_KEY, JSON.stringify(articles));
  await store.put(CACHE_META_KEY, JSON.stringify(meta));
}

function stripHTML(v) {
  return String(v || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
function cleanImage(img, seed) {
  if (!img || !/^https?:\/\//i.test(img)) return `https://picsum.photos/seed/${encodeURIComponent(seed || 'global-intel')}/900/520`;
  return img.replace(/^http:/, 'https:');
}
function validDate(v) { const d = new Date(v); return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); }
function cleanTopic(v) { return String(v || 'latest').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'latest'; }
function slug(v) { return String(v || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120) || `story-${Date.now()}`; }
function host(v) { try { return new URL(v).hostname.replace(/^www\./, ''); } catch { return 'Global Intel'; } }
function detectTopic(text) { text = String(text || '').toLowerCase(); if (/bitcoin|crypto|ethereum|blockchain/.test(text)) return 'crypto'; if (/stock|market|wall street|nasdaq|dow|shares|finance|bank|earnings/.test(text)) return 'markets'; if (/\bai\b|artificial intelligence|openai|chatgpt|gemini|robot/.test(text)) return 'artificial-intelligence'; if (/tech|technology|software|apple|google|microsoft|cyber/.test(text)) return 'technology'; if (/sport|nba|nfl|mlb|soccer|cricket|tennis/.test(text)) return 'sports'; if (/health|medical|medicine|hospital|doctor|disease/.test(text)) return 'health'; if (/science|space|nasa|climate|research|earthquake/.test(text)) return 'science'; if (/business|economy|company|startup|jobs|inflation/.test(text)) return 'business'; if (/politics|election|president|congress|senate|white house/.test(text)) return 'politics'; if (/world|europe|asia|middle east|africa|ukraine|russia|china|israel|iran/.test(text)) return 'world'; if (/weather|storm|hurricane|flood|wildfire|heat/.test(text)) return 'weather'; if (/movie|music|theater|art|culture|book/.test(text)) return 'culture'; return 'us'; }
function riskLevel(text) { return /war|attack|earthquake|wildfire|dead|killed|missile|hurricane|flood|crash/i.test(text) ? 'High' : /warning|alert|election|market|policy|strike|conflict/i.test(text) ? 'Medium' : 'Low'; }
function scoreImportance(text) { let s = 40; if (/breaking|urgent|live|war|attack|earthquake|fed|election/i.test(text)) s += 25; if (/market|stocks|crypto|oil|gold|ai/i.test(text)) s += 10; return Math.min(100, s); }
function tags(text) { const lower = String(text || '').toLowerCase(); return ['markets','crypto','weather','politics','world','technology','sports','health','science','conflict','ai','business'].filter(t => lower.includes(t) || (t === 'ai' && /artificial intelligence|\bai\b/.test(lower))).slice(0, 6); }
