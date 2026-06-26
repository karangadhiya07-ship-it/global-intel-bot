import {json} from './_utils.js';

export async function onRequestGet({request}) {
  const origin = new URL(request.url).origin;
  const results = await Promise.allSettled([
    fetch(`${origin}/api/earthquakes?minmag=5`).then(r=>r.json()),
    fetch(`${origin}/api/wildfires`).then(r=>r.json()),
    fetch(`${origin}/api/conflicts`).then(r=>r.json()),
    fetch(`${origin}/api/weather-alerts`).then(r=>r.json())
  ]);

  const data = results.map(r=>r.status==='fulfilled'?r.value:null).filter(Boolean);
  const quake = data[0]?.events?.length || 0;
  const fires = data[1]?.events?.length || 0;
  const conflicts = data[2]?.events?.length || 0;
  const weather = data[3]?.alerts?.filter(a=>a.level==='High').length || 0;
  const score = Math.min(100, quake*5 + fires*2 + conflicts*2 + weather*10);
  return json({score, level:score>70?'High':score>40?'Medium':'Low', inputs:{earthquakes:quake,wildfires:fires,conflicts,weatherHigh:weather}, updatedAt:new Date().toISOString()});
}
