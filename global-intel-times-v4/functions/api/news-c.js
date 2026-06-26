import { loadFeeds, sendNews } from './_rss.js';

const FEEDS = [
  'https://news.google.com/rss/search?q=new%20york&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=california&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=washington%20dc&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=crime%20usa&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=immigration%20usa&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=education%20usa&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=weather%20usa&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=markets%20wall%20street&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=bitcoin&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=stock%20market&hl=en-US&gl=US&ceid=US:en',

  'https://news.google.com/rss/search?q=trump&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=white%20house&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=congress&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=ukraine&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=china&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=middle%20east&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=climate&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=nasa&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=hollywood&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=music&hl=en-US&gl=US&ceid=US:en',

  'https://news.google.com/rss/search?q=food&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=travel&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=real%20estate&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=energy&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=oil%20prices&hl=en-US&gl=US&ceid=US:en'
];

export async function onRequestGet({ request }) {
  const topic = new URL(request.url).searchParams.get('topic') || 'usa';
  const { articles, errors } = await loadFeeds(FEEDS, topic);
  return sendNews(topic, articles, errors);
}
