import {json} from './_utils.js';
const ENDPOINTS = ['news','news-a','news-b','news-c','news-d','weather','markets','crypto','earthquakes','wildfires','weather-alerts','conflicts','risk','countries'];
export async function onRequestGet({request}) {
  const origin = new URL(request.url).origin;
  const checks = await Promise.allSettled(ENDPOINTS.map(async name => {
    const started=Date.now();
    const r=await fetch(`${origin}/api/${name}${name==='markets'?'?symbol=AAPL':''}`);
    let data={}; try{data=await r.json()}catch{}
    return {name, ok:r.ok, status:r.status, ms:Date.now()-started, count:data.count || data.articles?.length || data.events?.length || data.alerts?.length || data.quotes?.length || 0, error:data.error};
  }));
  return json({updatedAt:new Date().toISOString(), endpoints:checks.map(c=>c.status==='fulfilled'?c.value:{ok:false,error:c.reason?.message})});
}
