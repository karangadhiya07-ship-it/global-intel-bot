import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "https://www.theguardian.com/technology/rss",
  "https://www.theguardian.com/science/rss",
  "https://www.technologyreview.com/feed/",
  "https://www.engadget.com/rss.xml",
  "https://www.sciencedaily.com/rss/top.xml",
  "https://rss.dw.com/xml/rss-en-science",
  "https://news.google.com/rss/search?q=artificial%20intelligence&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=OpenAI%20OR%20AI%20OR%20artificial%20intelligence&hl=en-US&gl=US&ceid=US:en",
  "https://www.theverge.com/rss/index.xml",
  "https://techcrunch.com/feed/",
  "https://www.wired.com/feed/rss",
  "https://arstechnica.com/feed/",
  "https://www.nasa.gov/news-release/feed/",
  "https://www.nasa.gov/image-article/feed/",
  "https://phys.org/rss-feed/",
  "https://www.nature.com/nature.rss"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
