import {json,fallbackArticles,fetchJson} from './_utils.js';

const RSS_FEEDS = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'https://www.theguardian.com/us/rss',
  'https://www.theguardian.com/world/rss',
  'https://www.theguardian.com/business/rss',
  'https://www.theguardian.com/technology/rss',
  'https://www.npr.org/rss/rss.php?id=1001',
  'https://www.npr.org/rss/rss.php?id=1003',
  'https://www.npr.org/rss/rss.php?id=1006'
];

export async function onRequestGet({request,env}){
  const u = new URL(request.url);
  const topic = u.searchParams.get('topic') || 'usa breaking news';
  let articles = [];
  let errors = [];

  if(env.GNEWS_API_KEY){
    try{
      const d = await fetchJson(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&country=us&max=30&apikey=${env.GNEWS_API_KEY}`);
      articles.push(...(d.articles||[]).map(a=>({
        title:a.title,
        description:a.description,
        content:a.content || a.description,
        author:a.source?.name || 'GNews',
        image:a.image,
        publishedAt:a.publishedAt,
        url:a.url
      })));
    }catch(e){ errors.push('GNews: '+e.message); }
  }

  if(env.NEWS_API_KEY){
    try{
      const d = await fetchJson(`https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=30&sortBy=publishedAt&apiKey=${env.NEWS_API_KEY}`);
      articles.push(...(d.articles||[]).map(a=>({
        title:a.title,
        description:a.description,
        content:a.content || a.description,
        author:a.author || a.source?.name || 'NewsAPI',
        image:a.urlToImage,
        publishedAt:a.publishedAt,
        url:a.url
      })));
    }catch(e){ errors.push('NewsAPI: '+e.message); }
  }

  for(const feed of RSS_FEEDS){
    try{
      const rss = await fetch(feed, {headers:{'user-agent':'GlobalIntelTimes/1.0'}});
      if(!rss.ok) throw new Error('RSS failed '+rss.status);
      const xml = await rss.text();
      articles.push(...parseRSS(xml, feed));
    }catch(e){
      errors.push('RSS: '+e.message);
    }
  }

  articles = dedupe(articles)
    .filter(a => a.title)
    .sort((a,b)=>new Date(b.publishedAt||0)-new Date(a.publishedAt||0))
    .slice(0,120);

  return json({
    topic,
    articles: articles.length ? articles : fallbackArticles(topic),
    error: errors.length ? errors.join(' | ') : undefined
  });
}

function parseRSS(xml, sourceUrl){
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)];
  return items.slice(0,25).map(m=>{
    const item = m[0];
    const title = clean(tag(item,'title'));
    const link = clean(tag(item,'link'));
    const desc = stripHTML(clean(tag(item,'description')));
    const pub = clean(tag(item,'pubDate')) || new Date().toISOString();
    const img = findImage(item);

    return {
      title,
      description: desc || 'Latest update from Global Intel Times.',
      content: desc || title,
      author: getDomain(sourceUrl),
      image: img || `https://picsum.photos/seed/${encodeURIComponent(title)}/900/560`,
      publishedAt: new Date(pub).toISOString(),
      url: link || '#'
    };
  });
}

function tag(xml,name){
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? decode(m[1].replace(/^<!\[CDATA\[|\]\]>$/g,'')) : '';
}

function findImage(item){
  const media = item.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if(media) return media[1];
  const enclosure = item.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if(enclosure) return enclosure[1];
  const img = item.match(/<img[^>]+src=["']([^"']+)["']/i);
  return img ? img[1] : '';
}

function dedupe(list){
  const seen = new Set();
  return list.filter(a=>{
    const key = String(a.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,90);
    if(!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripHTML(v){
  return String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}

function decode(v){
  return String(v||'')
    .replaceAll('&amp;','&')
    .replaceAll('&lt;','<')
    .replaceAll('&gt;','>')
    .replaceAll('&quot;','"')
    .replaceAll('&#39;',"'");
}

function clean(v){
  return String(v||'').replace(/\s+/g,' ').trim();
}

function getDomain(url){
  try{return new URL(url).hostname.replace('www.','');}
  catch{return 'RSS';}
}
