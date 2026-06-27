import { json } from './_utils.js';
const ENDPOINTS=['news','news-a','news-b','news-c','news-d','search','earthquakes','wildfires','conflicts','risk','countries','weather','markets','crypto','sports','videos'];
export async function onRequestGet({request}){
  const origin=new URL(request.url).origin;
  const checks=await Promise.allSettled(ENDPOINTS.map(async name=>{
    const started=Date.now();
    const suffix=name==='markets'?'?symbol=AAPL':name==='search'?'?q=markets':'';
    const r=await fetch(`${origin}/api/${name}${suffix}`,{cf:{cacheTtl:60,cacheEverything:true}});
    let data={}; try{data=await r.json()}catch{}
    return {name,ok:r.ok,status:r.status,ms:Date.now()-started,count:data.count||data.articles?.length||data.results?.length||data.events?.length||data.quotes?.length||data.scores?.length||0,error:data.error||null,cache:data.meta?.cache||'edge/browser'};
  }));
  const endpoints=checks.map(c=>c.status==='fulfilled'?c.value:{ok:false,error:c.reason?.message});
  return json({version:'v8',updatedAt:new Date().toISOString(),summary:{endpoints:endpoints.length,ok:endpoints.filter(e=>e.ok).length,articleTarget:'500+',feedTarget:'100+'},endpoints});
}
