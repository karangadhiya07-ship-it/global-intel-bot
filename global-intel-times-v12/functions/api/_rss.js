import { json } from './_utils.js';

const PLACEHOLDER = '/assets/images/placeholder-news.svg';

export async function loadFeeds(feeds, topic='latest') {
  const uniqueFeeds = [...new Set(feeds)].slice(0, 40);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), 8500);
  const results = await Promise.allSettled(uniqueFeeds.map(url => loadFeed(url, controller.signal)));
  clearTimeout(timer);
  const articles = [];
  const errors = [];
  for (const r of results) {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else errors.push(String(r.reason?.message || r.reason || 'RSS failed'));
  }
  return {
    articles: enhanceArticles(dedupe(articles), topic).sort(byDateDesc),
    errors
  };
}

async function loadFeed(url, signal) {
  const res = await fetch(url, {
    signal,
    headers: {
      'user-agent': 'GlobalIntelTimesBot/8.0 (+https://global-intel-bot-v4.pages.dev)',
      'accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
    },
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  if (!res.ok) throw new Error(`${host(url)} ${res.status}`);
  const xml = await res.text();
  return parseRSS(xml, url);
}

export function parseRSS(xml, sourceUrl='') {
  const source = niceSource(sourceUrl);
  const blocks = [...String(xml||'').matchAll(/<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi)].map(m => m[0]).slice(0, 35);
  return blocks.map(block => {
    const title = cleanText(pick(block,'title')) || 'Global News Update';
    const rawDesc = pick(block,'content:encoded') || pick(block,'description') || pick(block,'summary') || pick(block,'content') || '';
    const description = summarize(cleanText(rawDesc), 260) || 'This story is developing. More details will be added as reliable updates become available.';
    const publishedAt = safeDate(cleanText(pick(block,'pubDate') || pick(block,'published') || pick(block,'updated') || pick(block,'dc:date')));
    const url = normalizeUrl(cleanText(pick(block,'link')) || attr(block,'link','href') || attr(block,'guid','isPermaLink') || sourceUrl);
    const image = normalizeImage(extractImage(block, rawDesc), title);
    const text = `${title} ${description}`;
    const section = detectSection(text);
    const country = detectCountry(text);
    const risk = riskScore(text);
    return {
      id: slug(`${title}-${source}`),
      title,
      description,
      summary: description,
      content: description,
      author: source,
      source,
      url,
      image,
      publishedAt,
      section,
      topic: section,
      category: section,
      country,
      tags: tags(text),
      riskLevel: risk.level,
      riskScore: risk.score,
      importance: importanceScore(text, source),
      trendingScore: trendingScore(text)
    };
  }).filter(a => a.title && a.url);
}

function extractImage(block, rawDesc='') {
  const candidates = [
    attr(block,'media:content','url'), attr(block,'media:thumbnail','url'), attr(block,'enclosure','url'),
    attr(block,'image','url'), attr(block,'itunes:image','href'), findImg(rawDesc), findImg(block),
    pick(block,'url')
  ].filter(Boolean);
  return candidates.find(u => /https?:\/\//i.test(u) && !/\.gif($|\?)/i.test(u)) || '';
}

function pick(block, tag) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const r = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i').exec(block);
  return r ? decode(r[1]) : '';
}
function attr(block, tag, name) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const r = new RegExp(`<${escaped}[^>]*\\s${name}=["']([^"']+)["'][^>]*>`, 'i').exec(block);
  return r ? decode(r[1]) : '';
}
function findImg(s) { const r = /<img[^>]+src=["']([^"']+)["']/i.exec(String(s||'')); return r ? decode(r[1]) : ''; }
export function cleanText(input) {
  return decode(String(input||''))
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function decode(s) {
  return String(s||'')
    .replace(/&#(\d+);/g, (_,n)=>String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_,n)=>String.fromCharCode(parseInt(n,16)))
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&nbsp;/g,' ');
}
function normalizeUrl(url) { try { return new URL(url).toString(); } catch { return '#'; } }
function normalizeImage(url, seed='news') {
  if (!url) return `${PLACEHOLDER}?s=${encodeURIComponent(slug(seed).slice(0,40))}`;
  try {
    const u = new URL(url);
    if (!['http:','https:'].includes(u.protocol)) return `${PLACEHOLDER}?s=${encodeURIComponent(slug(seed).slice(0,40))}`;
    return u.toString();
  } catch { return `${PLACEHOLDER}?s=${encodeURIComponent(slug(seed).slice(0,40))}`; }
}
function safeDate(v) { const d = new Date(v); return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); }
function byDateDesc(a,b) { return new Date(b.publishedAt||0) - new Date(a.publishedAt||0); }
function summarize(text, max=220) { text = cleanText(text); return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text; }
function host(url){ try { return new URL(url).hostname.replace(/^www\./,''); } catch { return 'Global Intel'; } }
function niceSource(url) { const h = host(url); return h.split('.')[0].replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase()); }
export function slug(v){ return String(v||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120) || 'story'; }
export function dedupe(list){ const seen = new Set(); return list.filter(a => { const k = slug(a.title).slice(0,92); if (!k || seen.has(k)) return false; seen.add(k); return true; }); }
export function articleMatchesTopic(a, topic){
  topic = String(topic||'latest').toLowerCase().replace(/-/g,' ');
  if (!topic || ['latest','all','usa','us','breaking news','usa breaking news'].includes(topic)) return true;
  const text = `${a.title} ${a.description} ${a.section} ${a.topic} ${a.country} ${(a.tags||[]).join(' ')}`.toLowerCase().replace(/-/g,' ');
  return text.includes(topic) || detectSection(text).replace(/-/g,' ') === topic;
}
function enhanceArticles(list, topic) { return list.filter(a => articleMatchesTopic(a, topic) || topic === 'latest' || topic === 'usa').map(a => ({ ...a, description: summarize(a.description, 260), content: summarize(a.content || a.description, 900) })); }
export function detectSection(text){
  text = ` ${String(text||'').toLowerCase()} `;
  if (/\b(bitcoin|crypto|ethereum|blockchain|coinbase|binance|token)\b/.test(text)) return 'crypto';
  if (/\b(stock|stocks|market|markets|wall street|nasdaq|dow|s&p|shares|earnings|fed|finance|forex|oil|gold|silver)\b/.test(text)) return 'markets';
  if (/\b(ai|artificial intelligence|openai|chatgpt|gemini|robot|machine learning)\b/.test(text)) return 'artificial-intelligence';
  if (/\b(tech|technology|software|apple|google|microsoft|cyber|semiconductor|chip)\b/.test(text)) return 'technology';
  if (/\b(nba|nfl|mlb|soccer|football|cricket|tennis|sport|sports|world cup|olympic)\b/.test(text)) return 'sports';
  if (/\b(health|medical|medicine|hospital|doctor|disease|virus|vaccine|pandemic)\b/.test(text)) return 'health';
  if (/\b(science|space|nasa|climate|research|earthquake|volcano|wildfire)\b/.test(text)) return 'science';
  if (/\b(business|economy|company|startup|jobs|inflation|trade|bank|tariff)\b/.test(text)) return 'business';
  if (/\b(politics|election|president|congress|senate|white house|supreme court|minister|government)\b/.test(text)) return 'politics';
  if (/\b(weather|storm|hurricane|flood|heatwave|rain|snow|tornado)\b/.test(text)) return 'weather';
  if (/\b(movie|music|theater|art|culture|book|celebrity|entertainment)\b/.test(text)) return 'culture';
  if (/\b(europe|asia|africa|middle east|ukraine|russia|china|india|israel|iran|gaza|world)\b/.test(text)) return 'world';
  return 'us';
}
function detectCountry(text){
  const map = { 'United States':['united states','u.s.','us ','america','american','washington'], India:['india','delhi','mumbai'], China:['china','beijing'], Russia:['russia','moscow'], Ukraine:['ukraine','kyiv'], Israel:['israel'], Iran:['iran'], UnitedKingdom:['uk','britain','london','england'], Germany:['germany','berlin'], France:['france','paris'], Canada:['canada'], Australia:['australia'], Japan:['japan','tokyo'] };
  const s = ` ${String(text||'').toLowerCase()} `;
  for (const [country, words] of Object.entries(map)) if (words.some(w => s.includes(` ${w} `) || s.includes(w))) return country.replace('UnitedKingdom','United Kingdom');
  return 'Global';
}
function riskScore(text){
  const s = String(text||'').toLowerCase();
  let score = 8;
  if (/war|missile|attack|killed|dead|earthquake|wildfire|hurricane|flood|explosion|terror|shooting/.test(s)) score += 60;
  if (/conflict|sanction|strike|protest|warning|alert|crisis|emergency/.test(s)) score += 28;
  if (/market|inflation|rates|oil|bank|election/.test(s)) score += 12;
  score = Math.min(100, score);
  return { score, level: score >= 70 ? 'High' : score >= 35 ? 'Medium' : 'Low' };
}
function importanceScore(text, source=''){
  let score = 30;
  if (/breaking|live|urgent|exclusive|major|global|war|election|market|earthquake|wildfire/i.test(text)) score += 30;
  if (/nytimes|bbc|guardian|reuters|ap|npr|dw|aljazeera|cnbc|marketwatch/i.test(source)) score += 20;
  return Math.min(100, score);
}
function trendingScore(text){ let score = 20; if (/ai|trump|bitcoin|war|iran|israel|china|market|nvidia|apple|weather|earthquake/i.test(text)) score += 35; return Math.min(100, score); }
function tags(text){
  const s = String(text||'').toLowerCase();
  const out = [];
  const rules = { markets:/market|stock|nasdaq|dow|oil|gold|silver|fed/, crypto:/bitcoin|crypto|ethereum/, weather:/weather|storm|hurricane|flood|heat/, politics:/politics|election|president|congress/, world:/world|china|russia|ukraine|iran|israel|india/, technology:/tech|software|cyber|apple|google|microsoft/, sports:/sport|nba|nfl|soccer|cricket/, health:/health|medical|hospital|disease/, science:/science|space|nasa|climate/, conflict:/war|attack|missile|conflict/, ai:/\bai\b|artificial intelligence|openai/, business:/business|company|economy|startup/ };
  for (const [k,r] of Object.entries(rules)) if (r.test(s)) out.push(k);
  return out.slice(0,8);
}
export function sendNews(topic, articles, errors=[]){ return json({ topic, count: articles.length, articles, error: errors.length ? errors.slice(0,10).join(' | ') : undefined }, { 'Cache-Control':'public, max-age=60, s-maxage=300' }); }
