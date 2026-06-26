import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  "https://www.marketwatch.com/rss/topstories",
  "https://www.marketwatch.com/rss/marketpulse",
  "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
  "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml",
  "https://feeds.bbci.co.uk/news/business/rss.xml",
  "https://www.theguardian.com/business/rss",
  "https://www.cbsnews.com/latest/rss/moneywatch",
  "https://www.investing.com/rss/news.rss",
  "https://www.investing.com/rss/stock.rss",
  "https://www.ft.com/?format=rss",
  "https://feeds.feedburner.com/entrepreneur/latest",
  "https://www.fastcompany.com/rss.xml",
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://rss.dw.com/xml/rss-en-business",
  "https://abcnews.go.com/abcnews/moneyheadlines",
  "https://news.google.com/rss/search?q=business%20markets&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=stock%20market&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=crypto%20bitcoin&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=oil%20prices&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=gold%20prices&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=wall%20street&hl=en-US&gl=US&ceid=US:en"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
