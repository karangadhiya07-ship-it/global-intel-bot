import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
  "https://feeds.bbci.co.uk/sport/rss.xml",
  "https://www.theguardian.com/sport/rss",
  "https://www.espn.com/espn/rss/news",
  "https://www.sciencedaily.com/rss/health_medicine.xml",
  "https://www.pbs.org/newshour/feeds/rss/health",
  "https://feeds.feedburner.com/time/topstories",
  "https://news.google.com/rss/search?q=weather%20alerts&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=conflict%20war&hl=en-US&gl=US&ceid=US:en"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
