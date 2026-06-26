import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://www.marketwatch.com/rss/topstories',
  'https://www.marketwatch.com/rss/marketpulse',

  'https://www.investing.com/rss/news.rss',
  'https://www.investing.com/rss/stock.rss',

  'https://cointelegraph.com/rss',
  'https://decrypt.co/feed',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',

  'https://www.sciencedaily.com/rss/top.xml',
  'https://www.sciencedaily.com/rss/space_time.xml',
  'https://www.sciencedaily.com/rss/health_medicine.xml',

  'https://www.medicalnewstoday.com/rss',
  'https://www.healthline.com/rss',

  'https://feeds.feedburner.com/entrepreneur/latest',
  'https://www.fastcompany.com/rss.xml',

  'https://www.technologyreview.com/feed/',
  'https://www.engadget.com/rss.xml',
  'https://www.gamespot.com/feeds/mashup/',

  'https://feeds.feedburner.com/venturebeat/SZYF',

  'https://www.huffpost.com/section/front-page/feed',

  'https://www.economist.com/united-states/rss.xml',
  'https://www.economist.com/business/rss.xml',
  'https://www.economist.com/science-and-technology/rss.xml',

  'https://www.ft.com/?format=rss',

  'https://www.theatlantic.com/feed/all/',
  'https://slate.com/feeds/all.rss'
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';

  const { articles, errors } = await loadFeeds(FEEDS, topic);

  return sendNews(topic, articles, errors);
}
