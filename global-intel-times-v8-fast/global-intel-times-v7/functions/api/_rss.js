import { json, slug } from './_utils.js';

const MAX_FEEDS_PER_REQUEST = 36;
const MAX_ITEMS_PER_FEED = 25;
const DEFAULT_IMAGE = 'https://picsum.photos/seed/global-intel-times/900/560';

export async function loadFeeds(feeds, topic = 'latest', options = {}) {
  const limitFeeds = Number(options.limitFeeds || MAX_FEEDS_PER_REQUEST);
  const selected = feeds.slice(0, limitFeeds);
  const results = await Promise.allSettled(selected.map(url => loadFeed(url)));
  let articles = [], errors = [];
  for (const r of results) {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else errors.push(r.reason?.message || 'RSS failed');
  }
  const rawCount = articles.length;
  articles = dedupe(articles)
    .map(enrichArticle)
    .filter(a => a.title && a.url)
    .filter(a => articleMatchesTopic(a, topic))
    .sort((a, b) => (b.importanceScore + b.trendingScore) - (a.importanceScore + a.trendingScore) || new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, Number(options.limitArticles || 700));
  return { articles, errors, feedCount: selected.length, duplicateCount: Math.max(0, rawCount - articles.length) };
}

export async function loadFeed(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort('timeout'), 9000);
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'GlobalIntelTimes/8.0 (+https://globalinteltimes.pages.dev)' }, signal: controller.signal, cf: { cacheTtl: 600, cacheEverything: true } });
    if (!r.ok) throw new Error(`${host(url)} failed ${r.status}`);
    return parseRSS(await r.text(), url);
  } finally { clearTimeout(t); }
}

function parseRSS(xml, sourceUrl) {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)].slice(0, MAX_ITEMS_PER_FEED);
  return items.map(m => {
    const block = m[0];
    const title = strip(pick(block, 'title')) || 'News Update';
    const description = strip(pick(block, 'description') || pick(block, 'summary') || pick(block, 'content') || pick(block, 'content:encoded')) || 'Latest update from Global Intel Times.';
    const publishedAt = strip(pick(block, 'pubDate') || pick(block, 'published') || pick(block, 'updated') || pick(block, 'dc:date')) || new Date().toISOString();
    const link = normalizeLink(attr(block, 'link', 'href') || strip(pick(block, 'link')) || '#');
    const image = attr(block, 'media:content', 'url') || attr(block, 'media:thumbnail', 'url') || attr(block, 'enclosure', 'url') || findImage(block) || `https://picsum.photos/seed/${encodeURIComponent(title).slice(0,80)}/900/560`;
    const text = `${title} ${description}`;
    const section = detectSection(text);
    const source = sourceName(sourceUrl);
    return { id: slug(`${title}-${source}`), title, description, summary: summarize(description || title), content: description, author: source, image, publishedAt: safeDate(publishedAt), url: link, source, section, topic: section };
  });
}

function enrichArticle(a) {
  const text = `${a.title} ${a.description} ${a.content}`;
  const tags = detectTags(text);
  const country = detectCountry(text);
  const riskScore = scoreRisk(text);
  const importanceScore = scoreImportance(text, a.source);
  const trendingScore = scoreTrending(text, a.publishedAt);
  const popularityScore = Math.min(100, Math.round((importanceScore * 0.45) + (trendingScore * 0.35) + (tags.length * 4)));
  const sentiment = riskScore >= 65 ? 'Negative' : /growth|record|gain|rally|breakthrough|win|peace|deal/i.test(text) ? 'Positive' : 'Neutral';
  return {
    ...a,
    summary: summarize(a.description || a.summary || a.title),
    tags,
    country,
    sentiment,
    importanceScore,
    riskScore,
    trendingScore,
    popularityScore,
    riskLevel: riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low',
    keyPoints: keyPoints(text, tags, country),
    whyItMatters: whyItMatters(a.section, country, riskScore)
  };
}

function pick(block, tag) { const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(block); return r ? r[1] : ''; }
function attr(block, tag, name) { const r = new RegExp(`<${tag}[^>]*${name}=["']([^"']+)["'][^>]*>`, 'i').exec(block); return r ? decode(r[1]) : ''; }
function findImage(block) { const r = /<img[^>]+src=["']([^"']+)["']/i.exec(block); return r ? decode(r[1]) : ''; }
function strip(s) { return decode(String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()); }
function decode(s) { return String(s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' '); }
function host(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'rss'; } }
function sourceName(url) { return host(url).replace(/\.com|\.org|\.net|\.co\.uk|\.in/g, '').split('.').slice(-2).join(' ').replace(/\b\w/g, c => c.toUpperCase()); }
function safeDate(d) { const x = new Date(d); return Number.isNaN(x.getTime()) ? new Date().toISOString() : x.toISOString(); }
function normalizeLink(v) {
  let out = String(v || '#').split(' ')[0].trim() || '#';
  try {
    const u = new URL(out);
    const nested = u.searchParams.get('url');
    if (nested && /^https?:/i.test(nested)) out = nested;
  } catch {}
  return out;
}
export function dedupe(list) { const seen = new Set(); return list.filter(a => { const k = slug(String(a.title || '').replace(/ - [^-]+$/, '')).slice(0, 95); if (!k || seen.has(k)) return false; seen.add(k); return true; }); }

export function articleMatchesTopic(a, topic = 'latest') {
  const t = String(topic || 'latest').toLowerCase().replace(/-/g, ' ').trim();
  if (!t || ['latest','usa','us','breaking news','usa breaking news'].includes(t)) return true;
  const text = `${a.title} ${a.description} ${a.summary} ${a.section} ${a.topic} ${(a.tags || []).join(' ')} ${a.country}`.toLowerCase().replace(/-/g, ' ');
  if (text.includes(t)) return true;
  return detectSection(text).replace(/-/g, ' ') === t;
}

export function detectSection(text) {
  text = String(text || '').toLowerCase();
  if (/bitcoin|crypto|ethereum|blockchain|token|coinbase|binance/.test(text)) return 'crypto';
  if (/stock|market|wall street|nasdaq|dow|s&p|shares|earnings|finance|bank|fed|inflation|treasury/.test(text)) return 'markets';
  if (/oil|gas|gold|silver|copper|lithium|uranium|commodity|commodities|opec/.test(text)) return 'energy';
  if (/\bai\b|artificial intelligence|openai|chatgpt|gemini|claude|robot|machine learning/.test(text)) return 'artificial-intelligence';
  if (/tech|technology|software|apple|google|microsoft|cyber|semiconductor|chips/.test(text)) return 'technology';
  if (/sport|nba|nfl|mlb|soccer|cricket|tennis|olympic|formula 1/.test(text)) return 'sports';
  if (/health|medical|medicine|hospital|doctor|disease|virus|pandemic|vaccine/.test(text)) return 'health';
  if (/science|space|nasa|climate|research|earthquake|volcano/.test(text)) return 'science';
  if (/business|economy|company|startup|jobs|real estate|retail/.test(text)) return 'business';
  if (/politics|election|president|congress|senate|white house|parliament|minister/.test(text)) return 'politics';
  if (/weather|storm|hurricane|flood|wildfire|heat|cyclone|tornado/.test(text)) return 'weather';
  if (/movie|music|theater|art|culture|book|festival|celebrity/.test(text)) return 'culture';
  if (/opinion|editorial|essay|column/.test(text)) return 'opinion';
  if (/war|attack|missile|military|conflict|ukraine|russia|israel|iran|gaza|taiwan/.test(text)) return 'world';
  return 'world';
}

function detectTags(text) {
  const lower = String(text || '').toLowerCase();
  const dict = ['markets','crypto','weather','politics','world','technology','sports','health','science','conflict','ai','business','energy','commodities','election','cybersecurity','earthquake','wildfire','oil','gold','china','india','europe','middle-east'];
  return dict.filter(t => lower.includes(t.replace('-', ' ')) || (t === 'ai' && /artificial intelligence|\bai\b/.test(lower)) || (t === 'conflict' && /war|attack|missile|military/.test(lower))).slice(0, 8);
}
function detectCountry(text) {
  const countries = ['United States','India','China','Russia','Ukraine','Israel','Iran','United Kingdom','France','Germany','Japan','South Korea','Canada','Mexico','Brazil','Australia','Saudi Arabia','Turkey','Pakistan','Taiwan','Italy','Spain','South Africa'];
  const lower = String(text || '').toLowerCase();
  for (const c of countries) if (lower.includes(c.toLowerCase())) return c;
  if (/u\.s\.| us |america|american|white house|washington/.test(` ${lower} `)) return 'United States';
  if (/gaza|hamas/.test(lower)) return 'Israel / Palestine';
  if (/middle east/.test(lower)) return 'Middle East';
  return 'Global';
}
function scoreRisk(text) {
  const high = (String(text).match(/war|attack|missile|earthquake|wildfire|dead|killed|hurricane|flood|crash|sanction|invasion|terror|evacuat|pandemic/gi) || []).length;
  const med = (String(text).match(/warning|alert|strike|conflict|election|inflation|lawsuit|ban|recall|outage|protest/gi) || []).length;
  return Math.min(100, 15 + high * 22 + med * 9);
}
function scoreImportance(text, source) {
  const major = /nytimes|bbc|guardian|npr|dw|al jazeera|cnbc|marketwatch|pbs|abc|cbs|verge|wired|techcrunch|google news|yahoo|fortune|coindesk|cointelegraph/i.test(source) ? 12 : 0;
  const keywords = (String(text).match(/breaking|live|urgent|war|market|rate|president|election|ai|earthquake|wildfire|oil|gold|inflation|fed|china|india|russia/gi) || []).length;
  return Math.min(100, 35 + major + keywords * 8);
}
function scoreTrending(text, publishedAt) {
  const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 36e5);
  const recency = Math.max(0, 50 - ageHours * 2);
  const hot = (String(text).match(/breaking|live|trending|viral|record|surge|plunge|warns|crisis/gi) || []).length * 10;
  return Math.min(100, Math.round(25 + recency + hot));
}
function summarize(v) { const s = strip(v || ''); return s.length > 220 ? s.slice(0, 217).replace(/\s+\S*$/, '') + '...' : s || 'Latest update from Global Intel Times.'; }
function keyPoints(text, tags, country) { const pts = []; if (country && country !== 'Global') pts.push(`Primary geography: ${country}`); if (tags.length) pts.push(`Detected topics: ${tags.slice(0,4).join(', ')}`); pts.push(scoreRisk(text) >= 60 ? 'Risk signal is elevated.' : 'No extreme risk signal detected.'); return pts; }
function whyItMatters(section, country, risk) { return `${section || 'This'} update matters because it can affect public risk, markets, policy or regional intelligence${country && country !== 'Global' ? ` in ${country}` : ''}.${risk >= 60 ? ' The event is flagged for higher monitoring.' : ''}`; }

export function sendNews(topic, articles, errors = [], meta = {}) { return json({ topic, count: articles.length, articles, errors, error: errors.length ? errors.slice(0, 8).join(' | ') : undefined, meta: { version: 'v8', ...meta, updatedAt: new Date().toISOString() } }); }
