import {json,fetchJson} from './_utils.js';
export async function onRequestGet({request}) {
  const q = new URL(request.url).searchParams.get('q') || '(war OR conflict OR attack OR missile OR ceasefire OR military)';
  try {
    const d = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=ArtList&format=json&maxrecords=50&sort=HybridRel`);
    const events = (d.articles || []).map(a => ({
      title:a.title, url:a.url, source:a.sourceCountry || a.domain || 'GDELT', country:a.sourceCountry || '',
      time:a.seendate || new Date().toISOString(), description:a.snippet || '', image:a.socialimage || '',
      risk:/missile|attack|war|killed|strike/i.test(a.title || '') ? 'High' : 'Medium'
    }));
    return json({source:'GDELT', count:events.length, events});
  } catch(e) { return json({source:'GDELT', count:0, events:[], error:e.message}); }
}
