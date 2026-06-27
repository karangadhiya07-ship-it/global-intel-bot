import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://www.marketwatch.com/rss/topstories',
  'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://www.theguardian.com/business/rss',
  'https://www.cbsnews.com/latest/rss/moneywatch',
  'https://www.investing.com/rss/news.rss',
  'https://www.investing.com/rss/stock.rss',
  'https://www.investing.com/rss/forex.rss',
  'https://www.investing.com/rss/commodities.rss',
  'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  'https://www.cnbc.com/id/10001147/device/rss/rss.html',
  'https://finance.yahoo.com/news/rssindex',
  'https://cointelegraph.com/rss',
  'https://decrypt.co/feed',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://rss.dw.com/xml/rss-en-business',
  'https://news.google.com/rss/search?q=business%20markets&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=stock%20market%20today&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=oil%20gold%20silver%20commodities&hl=en-US&gl=US&ceid=US:en'
];

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
