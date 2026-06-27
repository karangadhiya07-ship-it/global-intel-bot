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
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/headlines/section/topic/NATION?hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en",
  "https://rss.cnn.com/rss/edition.rss",
  "https://rss.cnn.com/rss/edition_world.rss",
  "https://feeds.skynews.com/feeds/rss/world.xml",
  "https://www.france24.com/en/rss",
  "https://www.euronews.com/rss?level=theme&name=news",
  "https://www.voanews.com/api/zmgqoei$ii",
  "https://www.upi.com/rss/Top_News/World-News/",
  "https://www.upi.com/rss/Top_News/US/",
  "https://www.latimes.com/world-nation/rss2.0.xml",
  "https://feeds.washingtonpost.com/rss/world",
  "https://feeds.washingtonpost.com/rss/national"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
