import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  "https://www.marketwatch.com/rss/topstories",
  "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
  "https://feeds.bbci.co.uk/news/business/rss.xml",
  "https://www.theguardian.com/business/rss",
  "https://www.cbsnews.com/latest/rss/moneywatch",
  "https://www.investing.com/rss/news.rss",
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
  "https://rss.dw.com/xml/rss-en-business",
  "https://news.google.com/rss/search?q=business%20markets&hl=en-US&gl=US&ceid=US:en"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
