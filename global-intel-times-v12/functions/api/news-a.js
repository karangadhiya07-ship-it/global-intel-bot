import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/us_and_canada/rss.xml',
  'https://www.theguardian.com/world/rss',
  'https://www.theguardian.com/us-news/rss',
  'https://www.theguardian.com/politics/rss',
  'https://feeds.npr.org/1001/rss.xml',
  'https://feeds.npr.org/1004/rss.xml',
  'https://rss.dw.com/xml/rss-en-all',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://www.cbsnews.com/latest/rss/main',
  'https://abcnews.go.com/abcnews/topstories',
  'https://abcnews.go.com/abcnews/usheadlines',
  'https://www.pbs.org/newshour/feeds/rss/headlines',
  'https://feeds.skynews.com/feeds/rss/world.xml',
  'https://www.france24.com/en/rss'
];

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
