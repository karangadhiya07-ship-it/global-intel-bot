import { json, fallbackArticles } from './_utils.js';
import { dedupe, articleMatchesTopic } from './_rss.js';
export async function onRequestGet({ request }) {
  const u = new URL(request.url), topic = u.searchParams.get('topic') || 'usa', origin = u.origin;
  let articles=[], errors=[];
  for (const ep of ['news-a','news-b','news-c','news-d']) {
    try { const d=await fetch(`${origin}/api/${ep}?topic=${encodeURIComponent(topic)}`).then(r=>r.json()); articles.push(...(d.articles||[])); if(d.error)errors.push(`${ep}: ${d.error}`); }
    catch(e){ errors.push(`${ep}: ${e.message}`); }
  }
  articles=dedupe(articles).filter(a=>topic==='latest'||topic==='usa'?true:articleMatchesTopic(a,topic)).sort((a,b)=>new Date(b.publishedAt||0)-new Date(a.publishedAt||0)).slice(0,260);
  return json({topic,count:articles.length,articles:articles.length?articles:fallbackArticles(topic),error:errors.length?errors.slice(0,8).join(' | '):undefined});
}
