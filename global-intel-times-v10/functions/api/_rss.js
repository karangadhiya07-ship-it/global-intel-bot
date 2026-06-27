import { json } from './_utils.js';

const MAX_FEEDS_PER_REQUEST = 120;
const MAX_ITEMS_PER_FEED = 18;
const MAX_TOTAL_ARTICLES = 1200;
const FETCH_TIMEOUT_MS = 6500;

export async function loadFeeds(feeds, topic = 'latest') {
  const cleanFeeds = [...new Set((feeds || []).filter(Boolean))].slice(0, MAX_FEEDS_PER_REQUEST);
  const chunks = chunk(cleanFeeds, 18);
  let articles = [];
  let errors = [];

  for (const group of chunks) {
    const results = await Promise.allSettled(group.map(url => loadFeed(url)));
    for (const r of results) {
      if (r.status === 'fulfilled') articles.push(...r.value);
      else errors.push(r.reason?.message || 'RSS failed');
    }
    if (articles.length >= MAX_TOTAL_ARTICLES) break;
  }

  articles = dedupe(articles)
    .filter(a => a.title && a.url)
    .filter(a => isAllTopic(topic) ? true : articleMatchesTopic(a, topic))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, MAX_TOTAL_ARTICLES);

  return { articles, errors };
}

async function loadFeed(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      cf: { cacheTtl: 300, cacheEverything: true },
      headers: { 'user-agent': 'GlobalIntelTimes/8.1 (+https://global-intel-times.pages.dev)' }
    });
    if (!r.ok) throw new Error(`${host(url)} ${r.status}`);
    return parseRSS(await r.text(), url);
  } finally {
    clearTimeout(timer);
  }
}

function parseRSS(xml, sourceUrl) {
  const sourceHost = host(sourceUrl);
  const items = [...String(xml || '').matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)].slice(0, MAX_ITEMS_PER_FEED);
  return items.map(m => {
    const block = m[0];
    const title = strip(pick(block, 'title')) || 'News Update';
    const rawDescription = pick(block, 'description') || pick(block, 'summary') || pick(block, 'content:encoded') || pick(block, 'content');
    const description = strip(rawDescription) || 'Latest update from Global Intel Times.';
    const publishedAt = strip(pick(block, 'pubDate') || pick(block, 'published') || pick(block, 'updated') || pick(block, 'dc:date')) || new Date().toISOString();
    const link = normalizeGoogleNewsUrl(strip(pick(block, 'link')) || attr(block, 'link', 'href') || '#');
    const image = cleanImage(
      attr(block, 'media:content', 'url') ||
      attr(block, 'media:thumbnail', 'url') ||
      attr(block, 'enclosure', 'url') ||
      pickImageFromDescription(rawDescription) ||
      pickImageFromDescription(block) ||
      `https://picsum.photos/seed/${encodeURIComponent(title + sourceHost)}/900/560`
    );
    const text = `${title} ${description}`;
    const section = detectSection(text);
    const sourceName = prettySource(sourceHost, sourceUrl);
    return {
      id: slug(link && link !== '#' ? link : title),
      title,
      description,
      summary: description,
      content: description,
      author: sourceName,
      image,
      publishedAt: safeDate(publishedAt),
      url: link,
      source: sourceName,
      sourceName,
      section,
      topic: section,
      riskLevel: riskLevel(text),
      importance: scoreImportance(text),
      tags: tags(text)
    };
  });
}

function pick(block, tag) {
  const r = new RegExp(`<${escapeReg(tag)}[^>]*>([\\s\\S]*?)<\\/${escapeReg(tag)}>`, 'i').exec(block);
  return r ? r[1] : '';
}
function attr(block, tag, name) {
  const r = new RegExp(`<${escapeReg(tag)}[^>]*\\s${name}=["']([^"']+)["'][^>]*>`, 'i').exec(block);
  return r ? decode(r[1]) : '';
}
function pickImageFromDescription(s) {
  const r = /<img[^>]+src=["']([^"']+)["']/i.exec(String(s || '')) || /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/i.exec(String(s || ''));
  return r ? decode(r[1] || r[0]) : '';
}
function strip(s) {
  return decode(String(s || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}
function decode(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
function cleanImage(img) {
  const value = String(img || '').trim();
  if (!/^https?:\/\//i.test(value)) return '';
  return value.replace(/^http:/, 'https:');
}
function normalizeGoogleNewsUrl(link) {
  const value = decode(link || '').trim();
  if (!value) return '#';
  return value.replace(/^http:/, 'https:');
}
function host(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'rss'; } }
function prettySource(sourceHost, sourceUrl) {
  if (/nytimes/i.test(sourceHost)) return 'The New York Times';
  if (/bbc/i.test(sourceHost)) return 'BBC';
  if (/guardian/i.test(sourceHost)) return 'The Guardian';
  if (/aljazeera/i.test(sourceHost)) return 'Al Jazeera';
  if (/npr/i.test(sourceHost)) return 'NPR';
  if (/dw\.com/i.test(sourceHost)) return 'DW';
  if (/cnbc/i.test(sourceHost)) return 'CNBC';
  if (/marketwatch/i.test(sourceHost)) return 'MarketWatch';
  if (/coindesk/i.test(sourceHost)) return 'CoinDesk';
  if (/cointelegraph/i.test(sourceHost)) return 'CoinTelegraph';
  if (/google/i.test(sourceHost)) return 'Google News';
  if (/yahoo/i.test(sourceHost)) return 'Yahoo News';
  return sourceHost || host(sourceUrl) || 'RSS';
}
function safeDate(d) { const x = new Date(d); return Number.isNaN(x.getTime()) ? new Date().toISOString() : x.toISOString(); }
export function slug(v) { return String(v || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 140) || `story-${Math.random().toString(36).slice(2)}`; }
export function dedupe(list) {
  const seen = new Set();
  return (list || []).filter(a => {
    const k = slug(a.url && a.url !== '#' ? a.url : a.title).slice(0, 130);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
export function articleMatchesTopic(a, topic) {
  const t = String(topic || '').toLowerCase().replace(/-/g, ' ');
  if (isAllTopic(t)) return true;
  const text = `${a.title} ${a.description} ${a.section} ${a.topic} ${a.sourceName || a.source}`.toLowerCase().replace(/-/g, ' ');
  if (text.includes(t)) return true;
  const rules = {
    us: ['usa','u s','america','american','white house','congress','washington','trump','biden'],
    world: ['world','europe','asia','middle east','africa','ukraine','russia','china','israel','iran'],
    politics: ['politics','election','president','senate','congress','white house'],
    business: ['business','economy','company','inflation','startup','jobs'],
    markets: ['stock','market','wall street','nasdaq','dow','shares','finance','bank','oil','gold'],
    technology: ['technology','tech','software','apple','google','microsoft','cyber'],
    'artificial intelligence': ['ai','artificial intelligence','openai','chatgpt','gemini'],
    'artificial-intelligence': ['ai','artificial intelligence','openai','chatgpt','gemini'],
    crypto: ['bitcoin','crypto','ethereum','blockchain'],
    weather: ['weather','storm','rain','heat','snow','hurricane','flood','wildfire'],
    sports: ['sport','nba','nfl','mlb','soccer','cricket','tennis','world cup'],
    health: ['health','medical','medicine','hospital','doctor','disease'],
    science: ['science','space','nasa','climate','research','earthquake'],
    culture: ['culture','movie','music','book','theater','art'],
    opinion: ['opinion','editorial','essay']
  };
  return (rules[t] || [t]).some(w => text.includes(w)) || detectSection(text) === String(topic || '').toLowerCase();
}
function isAllTopic(topic) { return !topic || ['latest','all','usa','u-s','u.s.','home'].includes(String(topic).toLowerCase()); }
export function detectSection(text) {
  text = String(text || '').toLowerCase();
  if (/bitcoin|crypto|ethereum|blockchain/.test(text)) return 'crypto';
  if (/stock|market|wall street|nasdaq|dow|shares|finance|bank|earnings|oil|gold|silver/.test(text)) return 'markets';
  if (/\bai\b|artificial intelligence|openai|chatgpt|gemini|robot/.test(text)) return 'artificial-intelligence';
  if (/tech|technology|software|apple|google|microsoft|cyber/.test(text)) return 'technology';
  if (/sport|nba|nfl|mlb|soccer|cricket|tennis|world cup|football/.test(text)) return 'sports';
  if (/health|medical|medicine|hospital|doctor|disease|covid|vaccine/.test(text)) return 'health';
  if (/science|space|nasa|climate|research|earthquake/.test(text)) return 'science';
  if (/business|economy|company|startup|jobs|inflation|tariff/.test(text)) return 'business';
  if (/politics|election|president|congress|senate|white house|court/.test(text)) return 'politics';
  if (/world|europe|asia|middle east|africa|ukraine|russia|china|israel|iran|india|pakistan/.test(text)) return 'world';
  if (/weather|storm|hurricane|flood|wildfire|heat/.test(text)) return 'weather';
  if (/movie|music|theater|art|culture|book/.test(text)) return 'culture';
  return 'us';
}
function riskLevel(text) { return /war|attack|earthquake|wildfire|dead|killed|missile|hurricane|flood|crash|evacuation/i.test(text) ? 'High' : /warning|alert|election|market|policy|strike|conflict|tariff/i.test(text) ? 'Medium' : 'Low'; }
function scoreImportance(text) { let s = 45; if (/breaking|urgent|live|war|attack|earthquake|fed|election/i.test(text)) s += 25; if (/market|stocks|crypto|oil|gold|ai|climate/i.test(text)) s += 10; return Math.min(100, s); }
function tags(text) { const lower = String(text || '').toLowerCase(); return ['markets','crypto','weather','politics','world','technology','sports','health','science','conflict','ai','business'].filter(t => lower.includes(t) || (t === 'ai' && /artificial intelligence|\bai\b/.test(lower))).slice(0, 6); }
function chunk(arr, size) { const out = []; for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size)); return out; }
function escapeReg(v) { return String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function sendNews(topic, articles, errors = []) { return json({ topic, count: articles.length, total: articles.length, articles, error: errors.length ? errors.slice(0, 8).join(' | ') : undefined }); }
