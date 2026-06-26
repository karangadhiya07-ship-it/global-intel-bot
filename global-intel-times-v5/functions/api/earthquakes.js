import {json,fetchJson} from './_utils.js';

export async function onRequestGet({request}) {
  const u = new URL(request.url);
  const minmag = u.searchParams.get('minmag') || '4.5';
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&limit=50&minmagnitude=${encodeURIComponent(minmag)}`;
  try {
    const d = await fetchJson(url);
    const events = (d.features || []).map(f => ({
      id: f.id,
      title: f.properties?.title || f.properties?.place || 'Earthquake',
      place: f.properties?.place || '',
      magnitude: f.properties?.mag,
      time: new Date(f.properties?.time || Date.now()).toISOString(),
      url: f.properties?.url,
      tsunami: f.properties?.tsunami,
      coordinates: {
        lon: f.geometry?.coordinates?.[0],
        lat: f.geometry?.coordinates?.[1],
        depth: f.geometry?.coordinates?.[2]
      },
      risk: Number(f.properties?.mag || 0) >= 6 ? 'High' : Number(f.properties?.mag || 0) >= 5 ? 'Medium' : 'Low'
    }));
    return json({source:'USGS', count:events.length, events});
  } catch(e) {
    return json({source:'USGS', count:0, events:[], error:e.message});
  }
}
