import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
  'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  'https://www.theguardian.com/technology/rss',
  'https://www.theguardian.com/science/rss',
  'https://www.technologyreview.com/feed/',
  'https://www.engadget.com/rss.xml',
  'https://www.theverge.com/rss/index.xml',
  'https://www.wired.com/feed/rss',
  'https://www.sciencedaily.com/rss/top.xml',
  'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml',
  'https://rss.dw.com/xml/rss-en-science',
  'https://www.nasa.gov/news-release/feed/',
  'https://www.nasa.gov/rss/dyn/breaking_news.rss',
  'https://news.google.com/rss/search?q=artificial%20intelligence&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=cybersecurity&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=space%20nasa%20science&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=climate%20change&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=technology%20startups&hl=en-US&gl=US&ceid=US:en'
];

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
