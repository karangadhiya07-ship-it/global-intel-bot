import { json, fallbackArticles } from './_utils.js';
import { loadFeeds, dedupe, articleMatchesTopic, slug } from './_rss.js';

const CACHE_KEY = 'git:v8:articles:archive:v2';
const CACHE_META_KEY = 'git:v8:articles:archive:meta:v2';
const MAX_STORED = 8000;
const LIVE_REFRESH_MS = 60 * 1000;
const DEFAULT_LIMIT = 30;

const RSS_FEEDS = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  'https://feeds.bbci.co.uk/sport/rss.xml',
  'https://www.theguardian.com/world/rss',
  'https://www.theguardian.com/us-news/rss',
  'https://www.theguardian.com/us/business/rss',
  'https://www.theguardian.com/technology/rss',
  'https://www.theguardian.com/environment/rss',
  'https://www.theguardian.com/science/rss',
  'https://www.theguardian.com/sport/rss',
  'https://www.theguardian.com/culture/rss',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://rss.dw.com/xml/rss-en-all',
  'https://feeds.npr.org/1001/rss.xml',
  'https://feeds.npr.org/1004/rss.xml',
  'https://feeds.npr.org/1006/rss.xml',
  'https://feeds.npr.org/1007/rss.xml',
  'https://www.cbsnews.com/latest/rss/main',
  'https://www.cbsnews.com/latest/rss/world',
  'https://www.cbsnews.com/latest/rss/politics',
  'https://www.cbsnews.com/latest/rss/moneywatch',
  'https://www.pbs.org/newshour/feeds/rss/headlines',
  'https://www.pbs.org/newshour/feeds/rss/politics',
  'https://www.pbs.org/newshour/feeds/rss/world',
  'https://abcnews.go.com/abcnews/topstories',
  'https://abcnews.go.com/abcnews/internationalheadlines',
  'https://abcnews.go.com/abcnews/usheadlines',
  'https://abcnews.go.com/abcnews/politicsheadlines',
  'https://feeds.skynews.com/feeds/rss/world.xml',
  'https://feeds.skynews.com/feeds/rss/us.xml',
  'https://feeds.skynews.com/feeds/rss/business.xml',
  'https://feeds.skynews.com/feeds/rss/technology.xml',
  'https://www.france24.com/en/rss',
  'https://www.france24.com/en/international/rss',
  'https://www.france24.com/en/business-tech/rss',
  'https://www.scmp.com/rss/91/feed',
  'https://www.scmp.com/rss/2/feed',
  'https://www.scmp.com/rss/4/feed',
  'https://www.japantimes.co.jp/feed/topstories/',
  'https://www.japantimes.co.jp/feed/news/',
  'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml',
  'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
  'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml',
  'https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml',
  'https://indianexpress.com/section/world/feed/',
  'https://indianexpress.com/section/india/feed/',
  'https://indianexpress.com/section/business/feed/',
  'https://indianexpress.com/section/technology/feed/',
  'https://www.thehindu.com/news/national/feeder/default.rss',
  'https://www.thehindu.com/news/international/feeder/default.rss',
  'https://www.thehindu.com/business/feeder/default.rss',
  'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  'https://www.cnbc.com/id/100727362/device/rss/rss.html',
  'https://www.cnbc.com/id/19854910/device/rss/rss.html',
  'https://feeds.marketwatch.com/marketwatch/topstories/',
  'https://feeds.marketwatch.com/marketwatch/marketpulse/',
  'https://feeds.marketwatch.com/marketwatch/realtimeheadlines/',
  'https://finance.yahoo.com/news/rssindex',
  'https://www.investing.com/rss/news.rss',
  'https://www.investing.com/rss/stock.rss',
  'https://www.investing.com/rss/commodities.rss',
  'https://www.investing.com/rss/forex.rss',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cointelegraph.com/rss',
  'https://decrypt.co/feed',
  'https://www.theverge.com/rss/index.xml',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.wired.com/feed/rss',
  'https://techcrunch.com/feed/',
  'https://venturebeat.com/feed/',
  'https://www.engadget.com/rss.xml',
  'https://www.sciencedaily.com/rss/top.xml',
  'https://www.sciencedaily.com/rss/earth_climate.xml',
  'https://www.sciencedaily.com/rss/space_time.xml',
  'https://www.nasa.gov/news-release/feed/',
  'https://www.noaa.gov/rss.xml',
  'https://www.who.int/rss-feeds/news-english.xml',
  'https://www.nih.gov/news-events/news-releases/feed.xml',
  'https://www.cdc.gov/media/rss.htm',
  'https://www.espn.com/espn/rss/news',
  'https://www.espn.com/espn/rss/nfl/news',
  'https://www.espn.com/espn/rss/nba/news',
  'https://www.espn.com/espn/rss/mlb/news',
  'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
  'https://www.fifa.com/fifaplus/en/tournaments/rss.xml',
  'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/NATION?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=artificial%20intelligence&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=climate%20risk&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=geopolitics%20OR%20conflict&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=markets%20stocks%20oil%20gold&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=crypto%20bitcoin%20ethereum&hl=en-US&gl=US&ceid=US:en'
];

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const topic = cleanTopic(url.searchParams.get('topic') || 'latest');
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(80, Math.max(12, Number(url.searchParams.get('limit') || DEFAULT_LIMIT)));
  const since = url.searchParams.get('since');
  const id = url.searchParams.get('id');
  const force = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === '1';

  const store = getStore(env);
  let saved = await readSaved(store);
  let meta = await readMeta(store);
  const errors = [];
  const stale = !meta.updatedAt || (Date.now() - Number(meta.updatedAt)) > LIVE_REFRESH_MS;

  if (force || !saved.length || stale) {
    try {
      const live = await loadAllSources(env, topic);
      if (live.length) {
        saved = mergeArticles(live, saved).slice(0, MAX_STORED);
        meta = { updatedAt: Date.now(), total: saved.length, source: store ? 'kv-archive' : 'live-no-kv', feeds: RSS_FEEDS.length };
        await writeSaved(store, saved, meta);
      }
    } catch (e) {
      errors.push(e.message || 'live refresh failed');
    }
  }

  if (!saved.length) saved = fallbackArticles(topic);

  if (id) {
    const article = saved.find(a => a.id === id || slug(a.title) === id || slug(a.url) === id);
    return json({ article: article || null, count: article ? 1 : 0, total: article ? 1 : 0, cache: meta, error: errors[0] });
  }

  let filtered = isAllTopic(topic) ? saved : saved.filter(a => articleMatchesTopic(a, topic) || a.topic === topic || a.section === topic);

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
    archiveTotal: saved.length,
    hasMore: start + limit < filtered.length,
    lastUpdated: meta.updatedAt ? new Date(Number(meta.updatedAt)).toISOString() : new Date().toISOString(),
    cache: meta,
    articles,
    error: errors.length ? errors.slice(0, 5).join(' | ') : undefined
  });
}

async function loadAllSources(env, topic) {
  const rss = await loadFeeds(RSS_FEEDS, 'latest');
  let articles = rss.articles || [];

  const apiCalls = [];
  if (env?.GNEWS_API_KEY) apiCalls.push(loadGNews(env.GNEWS_API_KEY, topic));
  if (env?.NEWS_API_KEY) apiCalls.push(loadNewsApi(env.NEWS_API_KEY, topic));

  const results = await Promise.allSettled(apiCalls);
  for (const r of results) if (r.status === 'fulfilled') articles.push(...r.value);
  return dedupe(articles).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
}

async function loadGNews(key, topic) {
  const q = isAllTopic(topic) ? 'breaking news OR world OR markets' : topic.replace(/-/g, ' ');
  const endpoint = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=100&apikey=${encodeURIComponent(key)}`;
  const r = await fetch(endpoint, { cf: { cacheTtl: 300 } });
  if (!r.ok) return [];
  const data = await r.json();
  return (data.articles || []).map(a => normalizeApiArticle(a, 'GNews'));
}

async function loadNewsApi(key, topic) {
  const q = isAllTopic(topic) ? 'world OR markets OR technology OR politics' : topic.replace(/-/g, ' ');
  const endpoint = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&pageSize=100&sortBy=publishedAt&apiKey=${encodeURIComponent(key)}`;
  const r = await fetch(endpoint, { cf: { cacheTtl: 300 } });
  if (!r.ok) return [];
  const data = await r.json();
  return (data.articles || []).map(a => normalizeApiArticle(a, a.source?.name || 'NewsAPI'));
}

function normalizeApiArticle(a, source) {
  const title = stripHTML(a.title || 'News Update');
  const summary = stripHTML(a.description || a.content || 'Latest update from Global Intel Times.');
  const text = `${title} ${summary}`;
  const section = detectTopic(text);
  return {
    id: slug(a.url || title),
    title,
    description: summary,
    summary,
    content: summary,
    author: stripHTML(a.author || source),
    image: cleanImage(a.image || a.urlToImage || ''),
    publishedAt: validDate(a.publishedAt || new Date().toISOString()),
    createdAt: new Date().toISOString(),
    url: a.url || '#',
    source,
    sourceName: source,
    section,
    topic: section,
    riskLevel: riskLevel(text),
    importance: scoreImportance(text),
    tags: tags(text)
  };
}

function mergeArticles(live, old) {
  const map = new Map();
  [...live, ...old].forEach(a => {
    const normalized = normalizeStoredArticle(a);
    const key = slug(normalized.url && normalized.url !== '#' ? normalized.url : normalized.title).slice(0, 150);
    if (!map.has(key)) map.set(key, normalized);
  });
  return [...map.values()].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
}
function normalizeStoredArticle(a) {
  const title = stripHTML(a.title || 'News Update');
  const summary = stripHTML(a.summary || a.description || a.content || 'Latest update from Global Intel Times.');
  const text = `${title} ${summary}`;
  return {
    id: slug(a.id || a.url || title),
    title,
    description: summary,
    summary,
    content: stripHTML(a.content || summary),
    author: stripHTML(a.author || a.sourceName || a.source || 'Global Intel Desk'),
    image: cleanImage(a.image || a.urlToImage || a.thumbnail || ''),
    publishedAt: validDate(a.publishedAt || a.pubDate || a.date || new Date().toISOString()),
    createdAt: a.createdAt || new Date().toISOString(),
    url: a.url || a.sourceUrl || '#',
    source: stripHTML(a.sourceName || a.source || host(a.url || '')),
    sourceName: stripHTML(a.sourceName || a.source || host(a.url || '')),
    section: cleanTopic(a.section || a.topic || detectTopic(text)),
    topic: cleanTopic(a.topic || a.section || detectTopic(text)),
    riskLevel: a.riskLevel || riskLevel(text),
    importance: Number(a.importance || scoreImportance(text)),
    tags: Array.isArray(a.tags) ? a.tags.slice(0, 8) : tags(text)
  };
}

function getStore(env) { return env?.ARTICLES_KV || env?.NEWS_KV || env?.GIT_NEWS_KV || env?.KV || null; }
async function readSaved(store) { if (!store?.get) return []; try { const raw = await store.get(CACHE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
async function readMeta(store) { if (!store?.get) return {}; try { const raw = await store.get(CACHE_META_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; } }
async function writeSaved(store, articles, meta) { if (!store?.put) return; await store.put(CACHE_KEY, JSON.stringify(articles)); await store.put(CACHE_META_KEY, JSON.stringify(meta)); }
function isAllTopic(topic) { return !topic || ['latest','all','usa','us','u-s','u-s-','u-s'].includes(String(topic).toLowerCase()); }
function stripHTML(v) { return String(v || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim(); }
function cleanImage(img) { if (!img || !/^https?:\/\//i.test(img)) return ''; return String(img).replace(/^http:/, 'https:'); }
function validDate(v) { const d = new Date(v); return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); }
function cleanTopic(v) { return String(v || 'latest').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'latest'; }
function host(v) { try { return new URL(v).hostname.replace(/^www\./, ''); } catch { return 'Global Intel'; } }
function detectTopic(text) { text = String(text || '').toLowerCase(); if (/bitcoin|crypto|ethereum|blockchain/.test(text)) return 'crypto'; if (/stock|market|wall street|nasdaq|dow|shares|finance|bank|earnings|oil|gold|silver/.test(text)) return 'markets'; if (/\bai\b|artificial intelligence|openai|chatgpt|gemini|robot/.test(text)) return 'artificial-intelligence'; if (/tech|technology|software|apple|google|microsoft|cyber/.test(text)) return 'technology'; if (/sport|nba|nfl|mlb|soccer|cricket|tennis|world cup|football/.test(text)) return 'sports'; if (/health|medical|medicine|hospital|doctor|disease|covid|vaccine/.test(text)) return 'health'; if (/science|space|nasa|climate|research|earthquake/.test(text)) return 'science'; if (/business|economy|company|startup|jobs|inflation|tariff/.test(text)) return 'business'; if (/politics|election|president|congress|senate|white house|court/.test(text)) return 'politics'; if (/world|europe|asia|middle east|africa|ukraine|russia|china|israel|iran|india|pakistan/.test(text)) return 'world'; if (/weather|storm|hurricane|flood|wildfire|heat/.test(text)) return 'weather'; if (/movie|music|theater|art|culture|book/.test(text)) return 'culture'; return 'us'; }
function riskLevel(text) { return /war|attack|earthquake|wildfire|dead|killed|missile|hurricane|flood|crash/i.test(text) ? 'High' : /warning|alert|election|market|policy|strike|conflict/i.test(text) ? 'Medium' : 'Low'; }
function scoreImportance(text) { let s = 40; if (/breaking|urgent|live|war|attack|earthquake|fed|election/i.test(text)) s += 25; if (/market|stocks|crypto|oil|gold|ai/i.test(text)) s += 10; return Math.min(100, s); }
function tags(text) { const lower = String(text || '').toLowerCase(); return ['markets','crypto','weather','politics','world','technology','sports','health','science','conflict','ai','business'].filter(t => lower.includes(t) || (t === 'ai' && /artificial intelligence|\bai\b/.test(lower))).slice(0, 6); }
