import { json } from './_utils.js';

export async function loadFeeds(feeds, topic='usa') {
  const results = await Promise.allSettled(feeds.slice(0,160).map(url => loadFeed(url)));
  let articles = [], errors = [];
  for (const r of results) {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else errors.push(r.reason?.message || 'RSS failed');
  }
  articles = dedupe(articles)
    .filter(a => a.title && a.url)
    .filter(a => isBroadTopic(topic) ? true : articleMatchesTopic(a, topic))
    .sort((a,b)=>new Date(b.publishedAt || 0)-new Date(a.publishedAt || 0))
    .slice(0,1200);
  return { articles, errors };
}

async function loadFeed(url) {
  const r = await fetch(url, { headers:{ 'user-agent':'GlobalIntelTimes/8.0' }, cf:{ cacheTtl:300, cacheEverything:true }});
  if (!r.ok) throw new Error(`${url} failed ${r.status}`);
  return parseRSS(await r.text(), url);
}

function parseRSS(xml, sourceUrl) {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)].slice(0,45);
  return items.map(m => {
    const block = m[0];
    const title = strip(pick(block,'title')) || 'News Update';
    const description = strip(pick(block,'description') || pick(block,'summary') || pick(block,'content:encoded')) || 'Latest update from Global Intel Times.';
    const publishedAt = strip(pick(block,'pubDate') || pick(block,'published') || pick(block,'updated')) || new Date().toISOString();
    const link = strip(pick(block,'link')) || attr(block,'link','href') || '#';
    const image = attr(block,'media:content','url') || attr(block,'media:thumbnail','url') || findImage(block) || `https://picsum.photos/seed/${encodeURIComponent(title)}/900/560`;
    const text = `${title} ${description}`;
    const section = detectSection(text);
    return { id:slug(title), title, description, content:description, author:host(sourceUrl), image, publishedAt:safeDate(publishedAt), url:link, source:host(sourceUrl), section, topic:section, riskLevel:riskLevel(text), tags:tags(text) };
  });
}

function pick(block, tag){ const r=new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i').exec(block); return r?r[1]:''; }
function attr(block, tag, name){ const r=new RegExp(`<${tag}[^>]*${name}=["']([^"']+)["'][^>]*>`,'i').exec(block); return r?decode(r[1]):''; }
function findImage(block){ const r=/<img[^>]+src=["']([^"']+)["']/i.exec(block); return r?decode(r[1]):''; }
function strip(s){ return decode(String(s||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()); }
function decode(s){ return String(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' '); }
function host(url){ try{return new URL(url).hostname.replace(/^www\./,'')}catch{return 'rss'} }
function safeDate(d){ const x=new Date(d); return Number.isNaN(x.getTime())?new Date().toISOString():x.toISOString(); }
export function slug(v){ return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'story'; }
export function dedupe(list){ const seen=new Set(); return list.filter(a=>{const k=slug(a.title).slice(0,85); if(!k||seen.has(k))return false; seen.add(k); return true;}); }
export function isBroadTopic(topic){ const t=String(topic||'').toLowerCase().trim(); return !t||['usa','us','latest','breaking','breaking news','top stories','home','homepage','all','usa breaking news'].includes(t); }
export function articleMatchesTopic(a, topic){ const t=String(topic||'').toLowerCase().replace(/-/g,' '); const text=`${a.title} ${a.description} ${a.section} ${a.topic}`.toLowerCase().replace(/-/g,' '); return isBroadTopic(t)||text.includes(t)||t.split(/\s+/).some(w=>w.length>2&&text.includes(w))||detectSection(text)===topic; }
export function detectSection(text){ text=String(text||'').toLowerCase(); if(/bitcoin|crypto|ethereum|blockchain/.test(text))return'crypto'; if(/stock|market|wall street|nasdaq|dow|shares|finance|bank/.test(text))return'markets'; if(/\bai\b|artificial intelligence|openai|chatgpt|gemini|robot/.test(text))return'artificial-intelligence'; if(/tech|technology|software|apple|google|microsoft|cyber/.test(text))return'technology'; if(/sport|nba|nfl|mlb|soccer|cricket|tennis/.test(text))return'sports'; if(/health|medical|medicine|hospital|doctor|disease/.test(text))return'health'; if(/science|space|nasa|climate|research|earthquake/.test(text))return'science'; if(/business|economy|company|startup|jobs|inflation/.test(text))return'business'; if(/politics|election|president|congress|senate|white house/.test(text))return'politics'; if(/world|europe|asia|middle east|africa|ukraine|russia|china|israel|iran/.test(text))return'world'; if(/weather|storm|hurricane|flood|wildfire|heat/.test(text))return'weather'; if(/movie|music|theater|art|culture|book/.test(text))return'culture'; return'us'; }
function riskLevel(text){ return /war|attack|earthquake|wildfire|dead|killed|missile|hurricane|flood|crash/i.test(text)?'High':/warning|alert|election|market|policy|strike|conflict/i.test(text)?'Medium':'Low'; }
function tags(text){ const lower=String(text||'').toLowerCase(); return ['markets','crypto','weather','politics','world','technology','sports','health','science','conflict','ai','business'].filter(t=>lower.includes(t)||(t==='ai'&&/artificial intelligence|\bai\b/.test(lower))).slice(0,6); }
export function sendNews(topic, articles, errors=[]){ return json({topic,count:articles.length,articles,error:errors.length?errors.slice(0,8).join(' | '):undefined}); }
