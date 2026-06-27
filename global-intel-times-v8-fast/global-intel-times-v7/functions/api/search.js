import { json } from './_utils.js';
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').toLowerCase().trim();
  const topic = url.searchParams.get('topic') || 'latest';
  const data = await fetch(`${url.origin}/api/news?topic=${encodeURIComponent(topic)}&limit=700`, { cf: { cacheTtl: 300, cacheEverything: true } }).then(r => r.json());
  const articles = data.articles || [];
  const results = q ? articles.filter(a => `${a.title} ${a.summary} ${a.description} ${a.section} ${a.country} ${(a.tags||[]).join(' ')}`.toLowerCase().includes(q)) : articles;
  const suggestions = [...new Set(results.flatMap(a => [a.section, a.country, ...(a.tags || [])]).filter(Boolean))].slice(0, 20);
  return json({ q, count: results.length, results: results.slice(0, 300), suggestions, related: suggestions.slice(0, 8), updatedAt: new Date().toISOString() });
}
