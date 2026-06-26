import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
  "https://feeds.bbci.co.uk/sport/rss.xml",
  "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
  "https://www.theguardian.com/sport/rss",
  "https://www.theguardian.com/football/rss",
  "https://www.theguardian.com/culture/rss",
  "https://www.espn.com/espn/rss/news",
  "https://www.espn.com/espn/rss/nba/news",
  "https://www.espn.com/espn/rss/nfl/news",
  "https://www.sciencedaily.com/rss/health_medicine.xml",
  "https://www.medicalnewstoday.com/rss",
  "https://www.healthline.com/rss",
  "https://www.pbs.org/newshour/feeds/rss/health",
  "https://www.huffpost.com/section/front-page/feed",
  "https://feeds.feedburner.com/time/topstories",
  "https://news.google.com/rss/search?q=weather%20alerts&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=conflict%20war&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=sports&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=movies%20music&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=health&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=food%20travel&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=new%20york&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
