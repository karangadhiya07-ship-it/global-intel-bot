import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
  'https://feeds.bbci.co.uk/sport/rss.xml',
  'https://www.theguardian.com/sport/rss',
  'https://www.theguardian.com/lifeandstyle/rss',
  'https://www.theguardian.com/culture/rss',
  'https://www.espn.com/espn/rss/news',
  'https://www.sciencedaily.com/rss/health_medicine.xml',
  'https://www.pbs.org/newshour/feeds/rss/health',
  'https://feeds.feedburner.com/time/topstories',
  'https://news.google.com/rss/search?q=weather%20alerts&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=conflict%20war&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=health%20medicine&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=sports%20scores&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=entertainment%20culture&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=wildfire%20earthquake&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=india%20news&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=middle%20east%20news&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=europe%20news&hl=en-US&gl=US&ceid=US:en'
];

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
