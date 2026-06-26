import {json,fetchJson} from './_utils.js';
export async function onRequestGet() {
  try {
    const d = await fetchJson('https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=50');
    const events = (d.events || []).map(e => ({
      id:e.id, title:e.title, description:e.description || 'Active wildfire event', url:e.link || '',
      categories:(e.categories || []).map(c => c.title).join(', '),
      time:e.geometry?.[0]?.date || new Date().toISOString(),
      coordinates:{lon:e.geometry?.[0]?.coordinates?.[0],lat:e.geometry?.[0]?.coordinates?.[1]},
      risk:'Medium'
    }));
    return json({source:'NASA EONET', count:events.length, events});
  } catch(e) { return json({source:'NASA EONET', count:0, events:[], error:e.message}); }
}
