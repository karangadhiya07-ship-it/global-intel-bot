import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
  'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
  'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',

  'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',

  'https://www.cbsnews.com/latest/rss/us',
  'https://www.cbsnews.com/latest/rss/world',
  'https://www.cbsnews.com/latest/rss/politics',
  'https://www.cbsnews.com/latest/rss/moneywatch',
  'https://www.cbsnews.com/latest/rss/technology',

  'https://abcnews.go.com/abcnews/usheadlines',
  'https://abcnews.go.com/abcnews/internationalheadlines',
  'https://abcnews.go.com/abcnews/politicsheadlines',
  'https://abcnews.go.com/abcnews/moneyheadlines',
  'https://abcnews.go.com/abcnews/technologyheadlines',

  'https://www.pbs.org/newshour/feeds/rss/headlines',
  'https://www.pbs.org/newshour/feeds/rss/politics',
  'https://www.pbs.org/newshour/feeds/rss/economy',
  'https://www.pbs.org/newshour/feeds/rss/world',

  'https://feeds.feedburner.com/time/topstories',
  'https://www.forbes.com/business/feed/',
  'https://feeds.feedburner.com/businessinsider'
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
