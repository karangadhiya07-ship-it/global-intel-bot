import { json, fallbackArticles, fetchJson } from './_utils.js';

const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=usa&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=world&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=politics&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=business&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=artificial%20intelligence&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=crypto&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=sports&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=health&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=science&hl=en-US&gl=US&ceid=US:en',

  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',

  'https://www.theguardian.com/us/rss',
  'https://www.theguardian.com/world/rss',
  'https://www.theguardian.com/business/rss',
  'https://www.theguardian.com/technology/rss',
  'https://www.theguardian.com/sport/rss',

  'https://www.npr.org/rss/rss.php?id=1001',
  'https://www.npr.org/rss/rss.php?id=1003',
  'https://www.npr.org/rss/rss.php?id=1006',
  'https://www.npr.org/rss/rss.php?id=1007',

  'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  'https://www.cnbc.com/id/19854910/device/rss/rss.html'
];

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const topic = (u.searchParams.get('topic') || 'usa').toLowerCase();

  let articles = [];
  let errors = [];

  // 1) RSS primary
  const feedResults = await Promise.allSettled(
    RSS_FEEDS.map(feed => loadRSS(feed))
  );

  for (const r of feedResults) {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else errors.push('RSS: ' + r.reason.message);
  }

  // 2) NewsAPI backup
  if (env.NEWS_API_KEY) {
    try {
      const d = await fetchJson(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=50&sortBy=publishedAt&apiKey=${env.NEWS_API_KEY}`
      );

      articles.push(...(d.articles || []).map(a => ({
        title: a.title,
        description: a.description,
        content: a.content || a.description,
        author: a.author || a.source?.name || 'NewsAPI',
        image: a.urlToImage || fallbackImage(a.title),
        publishedAt: a.publishedAt,
        url: a.url,
        section: detectSection(a.title + ' ' + a.description),
        topic: detectSection(a.title + ' ' + a.description)
      })));
    } catch (e) {
      errors.push('NewsAPI: ' + e.message);
    }
  }

  // 3) GNews last backup only
  if (env.GNEWS_API_KEY && articles.length < 40) {
    try {
      const d = await fetchJson(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&country=us&max=30&apikey=${env.GNEWS_API_KEY}`
      );

      articles.push(...(d.articles || []).map(a => ({
        title: a.title,
        description: a.description,
        content: a.content || a.description,
        author: a.source?.name || 'GNews',
        image: a.image || fallbackImage(a.title),
        publishedAt: a.publishedAt,
        url: a.url,
        section: detectSection(a.title + ' ' + a.description),
        topic: detectSection(a.title + ' ' + a.description)
      })));
    } catch (e) {
      errors.push('GNews: ' + e.message);
    }
  }

  articles = dedupe(articles)
    .filter(a => a.title && a.url)
    .filter(a => topic === 'latest' || topic === 'usa' ? true : articleMatchesTopic(a, topic))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 150);

  return json({
    topic,
    articles: articles.length ? articles : fallbackArticles(topic),
    error: errors.length ? errors.slice(0, 8).join(' | ') : undefined
  });
}

async function loadRSS(feed) {
  const r = await fetch(feed, {
    headers: { 'user-agent': 'GlobalIntelTimes/1.0' }
  });

  if (!r.ok) throw new Error(`${feed} failed ${r.status}`);

  const xml = await r.text();
  return parseRSS(xml, feed);
}

function parseRSS(xml, sourceUrl) {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)];

  return items.slice(0, 20).map(m => {
    const item = m[0];

    const title = clean(tag(item, 'title'));
    const link = clean(tag(item, 'link'));
    const desc = stripHTML(clean(tag(item, 'description')));
    const pub = clean(tag(item, 'pubDate')) || clean(tag(item, 'updated')) || new Date().toISOString();
    const img = findImage(item);
    const section = detectSection(title + ' ' + desc + ' ' + sourceUrl);

    return {
      title,
      description: desc || 'Latest update from Global Intel Times.',
      content: desc || title,
      author: getDomain(sourceUrl),
      image: img || fallbackImage(title),
      publishedAt: safeDate(pub),
      url: normalizeGoogleNewsUrl(link),
      section,
      topic: section
    };
  });
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? decode(m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '')) : '';
}

function findImage(item) {
  const media = item.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (media) return media[1];

  const thumb = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumb) return thumb[1];

  const enclosure = item.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosure) return enclosure[1];

  const img = item.match(/<img[^>]+src=["']([^"']+)["']/i);
  return img ? img[1] : '';
}

function dedupe(list) {
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

function articleMatchesTopic(a, topic) {
  const text = `${a.title || ''} ${a.description || ''} ${a.section || ''}`.toLowerCase();

  const map = {
    us: ['us', 'usa', 'america', 'white house', 'congress', 'new york', 'washington'],
    world: ['world', 'global', 'europe', 'asia', 'middle east', 'africa', 'ukraine', 'russia', 'china'],
    politics: ['politics', 'election', 'president', 'congress', 'senate', 'trump', 'biden'],
    business: ['business', 'economy', 'company', 'startup', 'jobs', 'bank'],
    markets: ['market', 'stock', 'wall street', 'nasdaq', 'dow', 'shares'],
    technology: ['technology', 'tech', 'software', 'apple', 'google', 'microsoft'],
    ai: ['ai', 'artificial intelligence', 'openai', 'chatgpt'],
    crypto: ['crypto', 'bitcoin', 'ethereum', 'blockchain'],
    sports: ['sports', 'nba', 'nfl', 'mlb', 'soccer', 'cricket'],
    health: ['health', 'medical', 'medicine', 'hospital', 'doctor'],
    science: ['science', 'space', 'nasa', 'climate'],
    culture: ['culture', 'movie', 'music', 'theater', 'art'],
    lifestyle: ['lifestyle', 'travel', 'food', 'style', 'fashion']
  };

  const words = map[topic] || [topic];
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
  return String(v || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'RSS';
  }
}

function safeDate(v) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function fallbackImage(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed || 'news')}/900/560`;
}

function normalizeGoogleNewsUrl(url) {
  return url || '#';
}
