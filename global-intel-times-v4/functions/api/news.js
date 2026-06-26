import { json, fallbackArticles, fetchJson } from './_utils.js';
import { dedupe, articleMatchesTopic } from './_rss.js';

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const topic = u.searchParams.get('topic') || 'usa';
  const origin = u.origin;

  let articles = [];
  let errors = [];

  // Compatibility endpoint:
  // /api/news old app.js માટે ચાલુ રહેશે.
  // Full 100 RSS માટે app.js પછી news-a/b/c/d call કરશે.
  try {
    const r = await fetch(`${origin}/api/news-a?topic=${encodeURIComponent(topic)}`);
    const d = await r.json();

    articles.push(...(d.articles || []));

    if (d.error) {
      errors.push(d.error);
    }
  } catch (e) {
    errors.push('news-a: ' + e.message);
  }

  // NewsAPI backup
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
        section: detectBasicSection(a.title + ' ' + a.description),
        topic: detectBasicSection(a.title + ' ' + a.description)
      })));
    } catch (e) {
      errors.push('NewsAPI: ' + e.message);
    }
  }

  // GNews last backup only
  // GNews daily free limit ઓછી છે, એટલે last માં જ use કરીએ છીએ.
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
        section: detectBasicSection(a.title + ' ' + a.description),
        topic: detectBasicSection(a.title + ' ' + a.description)
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
    error: errors.length ? errors.slice(0, 6).join(' | ') : undefined
  });
}

function detectBasicSection(text) {
  text = String(text || '').toLowerCase();

  if (/bitcoin|crypto|ethereum|blockchain/.test(text)) return 'crypto';
  if (/stock|market|wall street|nasdaq|dow|shares|finance/.test(text)) return 'markets';
  if (/ai|artificial intelligence|openai|chatgpt/.test(text)) return 'artificial-intelligence';
  if (/tech|technology|software|apple|google|microsoft|cyber/.test(text)) return 'technology';
  if (/sport|nba|nfl|mlb|soccer|cricket|tennis/.test(text)) return 'sports';
  if (/health|medical|medicine|hospital|doctor|patient/.test(text)) return 'health';
  if (/science|space|nasa|climate|research/.test(text)) return 'science';
  if (/business|economy|company|startup|bank|jobs/.test(text)) return 'business';
  if (/politics|election|president|congress|senate|white house/.test(text)) return 'politics';
  if (/world|europe|asia|middle east|africa|ukraine|russia|china/.test(text)) return 'world';
  if (/movie|music|theater|art|culture/.test(text)) return 'culture';

  return 'us';
}

function fallbackImage(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed || 'news')}/900/560`;
}
