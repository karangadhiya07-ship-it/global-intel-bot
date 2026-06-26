import {json} from './_utils.js';
export async function onRequestPost({request,env}) {
  const body = await request.json().catch(()=>({}));
  const title = body.title || '';
  const content = body.content || body.description || '';
  if (env.GEMINI_API_KEY) {
    try {
      const prompt = `Summarize this article. Return short summary, key points, why it matters, tags, risk level:\n${title}\n${content}`.slice(0,6000);
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
      if(!r.ok) throw new Error('Gemini failed '+r.status);
      const d = await r.json();
      return json({provider:'Gemini', raw:d.candidates?.[0]?.content?.parts?.[0]?.text || '', ...localSummary(title,content)});
    } catch(e) { return json({provider:'Local', ...localSummary(title,content), error:e.message}); }
  }
  return json({provider:'Local', ...localSummary(title,content)});
}
export async function onRequestGet(){return json({message:'POST title/content to this endpoint. Add GEMINI_API_KEY for Gemini summaries.'});}
function localSummary(title, content){const sentences=String(content||title||'').replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).filter(Boolean);const summary=sentences.slice(0,2).join(' ')||title||'Summary unavailable.';const keyPoints=sentences.slice(0,4).map(s=>s.replace(/[.!?]$/,'')).filter(Boolean);const text=`${title} ${content}`.toLowerCase();const tags=['markets','crypto','weather','politics','world','technology','sports','health','science','conflict','ai'].filter(t=>text.includes(t));const riskLevel=/war|attack|earthquake|wildfire|crash|dead|killed|hurricane|flood/i.test(text)?'High':/market|election|policy|warning|alert/i.test(text)?'Medium':'Low';return{summary,keyPoints:keyPoints.length?keyPoints:['Developing story'],whyItMatters:'This story may affect public awareness, markets, policy, or regional risk depending on how it develops.',tags:tags.length?tags:['news'],riskLevel};}
