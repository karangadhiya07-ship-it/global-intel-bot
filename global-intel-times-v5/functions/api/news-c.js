import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [

'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',

'https://feeds.bbci.co.uk/news/rss.xml',
'https://feeds.bbci.co.uk/news/world/rss.xml',
'https://feeds.bbci.co.uk/news/business/rss.xml',
'https://feeds.bbci.co.uk/news/technology/rss.xml',

'https://www.theguardian.com/world/rss',
'https://www.theguardian.com/us-news/rss',
'https://www.theguardian.com/business/rss',
'https://www.theguardian.com/technology/rss',

'https://feeds.npr.org/1001/rss.xml',
'https://feeds.npr.org/1004/rss.xml',

'https://www.aljazeera.com/xml/rss/all.xml',

'https://rss.dw.com/xml/rss-en-all',
'https://rss.dw.com/xml/rss-en-business',
'https://rss.dw.com/xml/rss-en-science',

'https://www.cbsnews.com/latest/rss/main',
'https://www.cbsnews.com/latest/rss/world',
'https://www.cbsnews.com/latest/rss/politics',

'https://www.pbs.org/newshour/feeds/rss/headlines',
'https://www.pbs.org/newshour/feeds/rss/world',
'https://www.pbs.org/newshour/feeds/rss/politics'

];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
