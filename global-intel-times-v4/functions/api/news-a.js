import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://news.google.com/rss/search?q=usa&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=world&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=politics&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=business&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=artificial%20intelligence&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=crypto&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=sports&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=health&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=science&hl=en-US&gl=US&ceid=US:en',

  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'https://feeds.bbci.co.uk/sport/rss.xml',

  'https://www.theguardian.com/us/rss',
  'https://www.theguardian.com/world/rss',
  'https://www.theguardian.com/business/rss',
  'https://www.theguardian.com/technology/rss',
  'https://www.theguardian.com/sport/rss',

  'https://www.npr.org/rss/rss.php?id=1001',
  'https://www.npr.org/rss/rss.php?id=1003',
  'https://www.npr.org/rss/rss.php?id=1006',
  'https://www.npr.org/rss/rss.php?id=1007',

  'https://www.cnbc.com/id/100003114/device/rss/rss.html'
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
