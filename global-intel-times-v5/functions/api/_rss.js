import { json } from './_utils.js';

export async function loadFeeds(feeds, topic = 'usa') {
  const results = await Promise.allSettled(feeds.map(feed => loadRSS(feed)));
  let articles = [];
  let errors = [];

  for (const r of results) {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else errors.push(r.reason?.message || 'RSS failed');
  }

  articles = dedupe(articles)
    .filter(a => a.title && a.url)
    .filter(a => topic === 'latest' || topic === 'usa' ? true : articleMatchesTopic(a, topic))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 150);

  return { articles, errors };
}

export function sendNews(topic, articles, errors = []) {
  return json({
    topic,
    articles,
    error: errors.length ? errors.slice(0, 6).join(' | ') : undefined
  });
}

async function loadRSS(feed) {
  const response = await fetch(feed, {
    headers: { 'user-agent': 'GlobalIntelTimes/5.0' }
  });

  if (!response.ok) {
    throw new Error(`${feed} failed ${response.status}`);
  }

  const xml = await response.text();
  return parseRSS(xml, feed);
}

function parseRSS(xml, sourceUrl) {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)];

  return items.slice(0, 20).map(match => {
    const item = match[0];

    const title = clean(tag(item, 'title'));
    const description = stripHTML(clean(tag(item, 'description')));
    const link = clean(tag(item, 'link'));
    const pubDate =
      clean(tag(item, 'pubDate')) ||
      clean(tag(item, 'updated')) ||
      new Date().toISOString();

    const section = detectSection(`${title} ${description} ${sourceUrl}`);

    return {
      title,
      description: description || 'Latest news update.',
      content: description || title,
      author: getDomain(sourceUrl),
      image: findImage(item) || fallbackImage(title),
      publishedAt: safeDate(pubDate),
      url: link || '#',
      section,
      topic: section
    };
  });
}

function tag(xml, name) {
  const m = xml.match(
    new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i')
  );

  return m ? decode(m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '')) : '';
}

function findImage(item) {
  const m =
    item.match(/<media:content[^>]+url=["']([^"']+)["']/i) ||
    item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i) ||
    item.match(/<enclosure[^>]+url=["']([^"']+)["']/i) ||
    item.match(/<img[^>]+src=["']([^"']+)["']/i);

  return m ? m[1] : '';
}

export function dedupe(list) {
  const seen = new Set();

  return list.filter(a => {
    const key = String(a.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 100);

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function articleMatchesTopic(a, topic) {
  const text = `${a.title || ''} ${a.description || ''} ${a.section || ''}`.toLowerCase();

  const map = {
    us: ['us', 'usa', 'america', 'white house', 'congress', 'new york', 'washington'],
    world: ['world', 'global', 'europe', 'asia', 'middle east', 'africa', 'ukraine', 'russia', 'china'],
    politics: ['politics', 'election', 'president', 'congress', 'senate', 'trump', 'biden'],
    business: ['business', 'economy', 'company', 'startup', 'jobs', 'bank'],
    markets: ['market', 'stock', 'wall street', 'nasdaq', 'dow', 'shares'],
    technology: ['technology', 'tech', 'software', 'apple', 'google', 'microsoft'],
    'artificial-intelligence': ['ai', 'artificial intelligence', 'openai', 'chatgpt'],
    ai: ['ai', 'artificial intelligence', 'openai', 'chatgpt'],
    crypto: ['crypto', 'bitcoin', 'ethereum', 'blockchain'],
    sports: ['sports', 'nba', 'nfl', 'mlb', 'soccer', 'cricket', 'tennis'],
    health: ['health', 'medical', 'medicine', 'hospital', 'doctor'],
    science: ['science', 'space', 'nasa', 'climate'],
    culture: ['culture', 'movie', 'music', 'theater', 'art'],
    lifestyle: ['lifestyle', 'travel', 'food', 'style', 'fashion']
  };

  const words = map[topic] || [topic.replace(/-/g, ' ')];
  return words.some(w => text.includes(w));
}

function detectSection(text) {
  text = String(text || '').toLowerCase();

  if (/bitcoin|crypto|ethereum|blockchain/.test(text)) return 'crypto';
  if (/stock|market|wall street|nasdaq|dow|shares|finance/.test(text)) return 'markets';
  if (/ai|artificial intelligence|openai|chatgpt/.test(text)) return 'artificial-intelligence';
  if (/tech|technology|software|apple|google|microsoft|cyber/.test(text)) return 'technology';
  if (/sport|nba|nfl|mlb|soccer|cricket|tennis|espn/.test(text)) return 'sports';
  if (/health|medical|medicine|hospital|doctor|patient/.test(text)) return 'health';
  if (/science|space|nasa|climate|research/.test(text)) return 'science';
  if (/business|economy|company|startup|bank|jobs/.test(text)) return 'business';
  if (/politics|election|president|congress|senate|white house/.test(text)) return 'politics';
  if (/world|europe|asia|middle east|africa|ukraine|russia|china/.test(text)) return 'world';
  if (/movie|music|theater|art|culture/.test(text)) return 'culture';

  return 'us';
}

function stripHTML(v) {
  return String(v || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decode(v) {
  return String(v || '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function clean(v) {
  return String(v || '').replace(/\s+/g, ' ').trim();
}

function safeDate(v) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'RSS';
  }
}

function fallbackImage(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed || 'news')}/900/560`;
}
