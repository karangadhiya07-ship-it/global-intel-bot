import {json,fallbackArticles,fetchJson} from './_utils.js';

export async function onRequestGet({request,env}){
  const u=new URL(request.url);
  const topic=u.searchParams.get('topic')||'usa breaking news';
  let articles=[];
  let errors=[];

  if(env.GNEWS_API_KEY){
    try{
      const d=await fetchJson(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&country=us&max=30&apikey=${env.GNEWS_API_KEY}`);
      articles=(d.articles||[]).map(a=>({
        title:a.title,
        description:a.description,
        content:a.content,
        author:a.source?.name||'GNews',
        image:a.image,
        publishedAt:a.publishedAt,
        url:a.url
      }));
    }catch(e){
      errors.push('GNews: '+e.message);
    }
  }

  if(!articles.length && env.NEWS_API_KEY){
    try{
      const d=await fetchJson(`https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=30&sortBy=publishedAt&apiKey=${env.NEWS_API_KEY}`);
      articles=(d.articles||[]).map(a=>({
        title:a.title,
        description:a.description,
        content:a.content,
        author:a.author||a.source?.name||'NewsAPI',
        image:a.urlToImage,
        publishedAt:a.publishedAt,
        url:a.url
      }));
    }catch(e){
      errors.push('NewsAPI: '+e.message);
    }
  }

  return json({
    topic,
    articles:articles.length?articles:fallbackArticles(topic),
    error:errors.length?errors.join(' | '):undefined
  });
}
