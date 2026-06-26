import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://www.cnbc.com/id/19854910/device/rss/rss.html',
  'https://feeds.skynews.com/feeds/rss/world.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',

  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',

  'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
  'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
  'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',

  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.theverge.com/rss/index.xml',
  'https://techcrunch.com/feed/',
  'https://www.wired.com/feed/rss',

  'https://www.espn.com/espn/rss/news',
  'https://www.vox.com/rss/index.xml',
  'https://www.politico.com/rss/politics-news.xml',
  'https://www.axios.com/feeds/feed.rss',
  'https://time.com/feed/',

  'https://www.usatoday.com/news/rss/',
  'https://abcnews.go.com/abcnews/topstories',
  'https://www.cbsnews.com/latest/rss/main',
  'https://www.nbcnews.com/id/3032091/device/rss/rss.xml',
  'https://mashable.com/feeds/rss/all'
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
