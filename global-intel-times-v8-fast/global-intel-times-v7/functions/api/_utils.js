export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public,max-age=120,s-maxage=300,stale-while-revalidate=1800',
      ...extraHeaders
    }
  });
}

export async function fetchJson(url, options = {}) {
  const r = await fetch(url, { headers: { 'user-agent': 'GlobalIntelTimes/8.0', ...(options.headers || {}) }, ...options });
  if (!r.ok) throw new Error('fetch failed ' + r.status + ' ' + url);
  return r.json();
}

export function fallbackArticles(topic = 'latest', total = 80) {
  const now = new Date().toISOString();
  const seed = [
    ['world','Global leaders monitor fast-moving diplomatic and security developments'],
    ['us','U.S. officials track breaking developments across major cities'],
    ['politics','Election and policy battles shape the national agenda'],
    ['markets','Wall Street watches rates, earnings and technology shares'],
    ['business','Companies prepare for a volatile global economy'],
    ['technology','Technology companies race to secure cloud and AI infrastructure'],
    ['artificial-intelligence','AI companies face new competition, regulation and investment'],
    ['crypto','Bitcoin and crypto traders watch risk appetite and liquidity'],
    ['weather','Extreme weather alerts expand across vulnerable regions'],
    ['health','Health systems monitor disease, hospitals and digital care'],
    ['science','Scientists track climate, space and research breakthroughs'],
    ['sports','Major sports leagues prepare for high-interest matchups'],
    ['culture','Culture, film, music and entertainment stories gain attention'],
    ['energy','Oil, gas and power markets react to global supply pressure'],
    ['conflict','Conflict risk remains elevated across several flashpoints']
  ];
  return Array.from({ length: total }, (_, i) => {
    const [section, base] = seed[i % seed.length];
    const title = `${base} — Briefing ${i + 1}`;
    return enrichFallback({
      id: slug(title), title,
      description: 'Fallback intelligence item shown when live feeds are unavailable. Deploy on Cloudflare Pages to enable live RSS and API data.',
      content: 'This is a fallback intelligence item. The live platform automatically replaces this with real RSS, API, market, weather and risk data when the Cloudflare Functions are online.',
      author: 'Global Intel Desk',
      image: `https://picsum.photos/seed/git-v8-${section}-${i}/900/560`,
      publishedAt: now,
      url: '#', source: 'Global Intel Times', section, topic: section
    });
  }).filter(a => topic === 'latest' || topic === 'usa' || topic === 'us' || a.topic === topic || a.section === topic);
}

function enrichFallback(a) {
  return { ...a, summary: a.description, tags: [a.section], sentiment: 'Neutral', importanceScore: 50, riskScore: 20, trendingScore: 40, popularityScore: 40, riskLevel: 'Low', country: 'Global', keyPoints: ['Live feeds update automatically', 'Risk and category detection are enabled'], whyItMatters: 'This item keeps the platform layout stable while live sources are unavailable.' };
}

export function slug(v){ return String(v || '').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120) || 'story'; }
