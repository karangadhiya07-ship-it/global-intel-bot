import {json} from './_utils.js';

export async function onRequestPost({request,env}) {
  const body = await request.json().catch(()=>({}));
  const title = body.title || '';
  const content = body.content || body.description || '';
  const text = `${title}. ${content}`.slice(0, 6000);

  if (env.GEMINI_API_KEY) {
    try {
      const prompt = `Summarize this news article for an intelligence news website. Return JSON with summary, keyPoints array, whyItMatters, tags array, riskLevel. Article: ${text}`;
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`, {
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
      });
      if(!r.ok) throw new Error('Gemini failed '+r.status);
      const d = await r.json();
      const raw = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return json({provider:'Gemini', raw, ...localSummary(title, content)});
    } catch(e) {
      return json({provider:'Local', ...localSummary(title, content), error:e.message});
    }
  }

  return json({provider:'Local', ...localSummary(title, content)});
}

export async function onRequestGet() {
  return json({message:'POST title/content to this endpoint for AI summary. Add GEMINI_API_KEY for real AI summaries.'});
}

function localSummary(title, content) {
  const sentences = String(content || title || '').replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0,2).join(' ') || title || 'Summary unavailable.';
  const keyPoints = sentences.slice(0,4).map(s=>s.replace(/[.!?]$/,'')).filter(Boolean);
  const text = `${title} ${content}`.toLowerCase();
  const tags = ['markets','crypto','weather','politics','world','technology','sports','health','science','conflict'].filter(t=>text.includes(t));
  const riskLevel = /war|attack|earthquake|wildfire|crash|dead|killed|hurricane|flood/i.test(text) ? 'High' : /market|election|policy|warning|alert/i.test(text) ? 'Medium' : 'Low';
  return {summary, keyPoints:keyPoints.length?keyPoints:['Developing story'], whyItMatters:'This story may affect public awareness, markets, policy, or regional risk depending on how it develops.', tags:tags.length?tags:['news'], riskLevel};
}
