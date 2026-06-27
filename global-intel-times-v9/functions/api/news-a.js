import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.theguardian.com/world/rss",
  "https://www.theguardian.com/us-news/rss",
  "https://feeds.npr.org/1001/rss.xml",
  "https://www.cbsnews.com/latest/rss/main",
  "https://www.pbs.org/newshour/feeds/rss/headlines",
  "https://abcnews.go.com/abcnews/usheadlines",
  "https://rss.dw.com/xml/rss-en-all",
  "https://www.aljazeera.com/xml/rss/all.xml"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
