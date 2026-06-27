export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || 'latest';
  const r = await fetch(`${url.origin}/api/news?topic=${encodeURIComponent(topic)}&refresh=1&limit=10`, {
    headers: { 'user-agent': 'GlobalIntelTimesCron/8.0' }
  });
  return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json;charset=UTF-8' } });
}
