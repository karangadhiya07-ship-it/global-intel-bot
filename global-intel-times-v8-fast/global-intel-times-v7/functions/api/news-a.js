import { loadFeeds, sendNews } from './_rss.js';
import { FEED_GROUPS } from './_sources.js';

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const limit = Number(url.searchParams.get('limit') || 220);
  const { articles, errors, feedCount } = await loadFeeds(FEED_GROUPS.a, topic, { limitArticles: limit, limitFeeds: 36 });
  return sendNews(topic, articles, errors, { feedGroup: 'a', feedCount });
}
