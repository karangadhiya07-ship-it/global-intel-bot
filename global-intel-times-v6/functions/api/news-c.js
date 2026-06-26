import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  "https://www.theguardian.com/technology/rss",
  "https://www.theguardian.com/science/rss",
  "https://www.technologyreview.com/feed/",
  "https://www.engadget.com/rss.xml",
  "https://feeds.feedburner.com/venturebeat/SZYF",
  "https://www.sciencedaily.com/rss/top.xml",
  "https://www.sciencedaily.com/rss/space_time.xml",
  "https://www.sciencedaily.com/rss/computers_math.xml",
  "https://www.sciencedaily.com/rss/earth_climate.xml",
  "https://rss.dw.com/xml/rss-en-science",
  "https://abcnews.go.com/abcnews/technologyheadlines",
  "https://news.google.com/rss/search?q=technology%20AI&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=artificial%20intelligence&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=cybersecurity&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=nasa&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=climate%20change&hl=en-US&gl=US&ceid=US:en",
  "https://www.pbs.org/newshour/feeds/rss/science",
  "https://www.pbs.org/newshour/feeds/rss/education",
  "https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml",
  "https://www.theguardian.com/environment/rss",
  "https://feeds.bbci.co.uk/news/health/rss.xml"
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
