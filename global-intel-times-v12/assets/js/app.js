const SITE_NAME = 'Global Intel Times';
const DEFAULT_IMG = './assets/images/placeholder-news.svg';
const API = { news:'./api/news', markets:'./api/markets', weather:'./api/weather', crypto:'./api/crypto', sports:'./api/sports', risk:'./api/risk', earthquakes:'./api/earthquakes', wildfires:'./api/wildfires', conflicts:'./api/conflicts', videos:'./api/videos', analytics:'./api/analytics' };
const TOP_MENU = { 'U.S.':['U.S.','Politics','Immigration','Crime','Weather'], World:['World','Europe','Asia','Middle East','Africa'], Business:['Business','Markets','Economy','Companies','Banking'], Technology:['Technology','AI','Cybersecurity','Startups'], Markets:['Stocks','Crypto','Gold','Oil','Forex'], Sports:['Sports','NBA','NFL','MLB','Soccer'], Health:['Health','Medicine','Pandemic'], Science:['Science','Climate','Space'], Culture:['Culture','Movies','Music'], Opinion:['Opinion','Editorials'] };
const WATCH = ['AAPL','MSFT','NVDA','TSLA','META','GOOGL','AMZN','NFLX','AMD','INTC','ORCL','IBM','JPM','BAC','V','MA','PYPL','COST','WMT','HD','MCD','NKE','DIS','BTC','ETH','GOLD','SILVER','OIL'];

let allArticles = [];
let currentPage = 1;
let hasMore = true;
let isLoading = false;
let latestSeen = localStorage.getItem('git-latest-seen') || new Date(Date.now() - 86400000).toISOString();

window.addEventListener('DOMContentLoaded', init);

async function init(){
  initUI();
  const page = pageName();
  if (page === 'article') await renderArticlePage();
  else if (page === 'search') await renderSearchPage();
  else if (page === 'category') await renderCategoryPage();
  else await renderHomePage();
  setInterval(checkNewStories, 60000);
}

function initUI(){
  setText('todayDate', new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }));
  setText('year', new Date().getFullYear());
  renderNav(); initTheme(); initSearch(); initScroll();
}
function pageName(){ const p = location.pathname.split('/').pop() || 'index.html'; return p.replace('.html','') || 'index'; }
function topicFromUrl(){ return (param('topic') || param('q') || 'latest').toLowerCase(); }

async function renderHomePage(){
  await loadNews({ topic:'latest', limit:220, page:1, append:false });
  renderHero(); renderMoreNews(); renderSections(); renderSidebars(); renderTicker();
  loadWidgets(); setupInfiniteScroll();
}
async function renderCategoryPage(){
  const topic = topicFromUrl();
  setPageTitle(`${titleCase(topic)} News`);
  await loadNews({ topic, limit:120, page:1, append:false });
  const existing = document.getElementById('categoryArticles');
  if (existing) { setText('categoryTitle', `${titleCase(topic)} News`); setText('categoryDescription', `${allArticles.length} live stories from global sources.`); existing.className = 'article-grid'; renderCardGrid('categoryArticles', allArticles); setupInfiniteScroll('categoryArticles', topic); return; }
  const mount = document.querySelector('#categoryGrid') || document.querySelector('#topStoriesSection') || document.querySelector('main') || document.body;
  mount.innerHTML = `<section class="container section-block"><div class="section-heading"><h1>${titleCase(topic)} News</h1><span id="articleCount">${allArticles.length} stories</span></div><div id="categoryGridInner" class="article-grid"></div><div id="loadState" class="load-state"></div></section>`;
  renderCardGrid('categoryGridInner', allArticles);
  setupInfiniteScroll('categoryGridInner', topic);
}
async function renderSearchPage(){
  const q = param('q') || '';
  setPageTitle(q ? `Search: ${q}` : 'Search');
  await loadNews({ topic: q || 'latest', limit:250, page:1, append:false });
  const results = q ? allArticles.filter(a => articleText(a).includes(q.toLowerCase())) : allArticles;
  const mount = document.querySelector('main') || document.body;
  mount.innerHTML = `<section class="container section-block"><div class="section-heading"><h1>Search</h1></div><form class="search-form"><input id="searchPageInput" value="${esc(q)}" placeholder="Search news"><button>Search</button></form><div id="searchResults" class="article-grid"></div></section>`;
  document.querySelector('.search-form').onsubmit = e => { e.preventDefault(); const v = document.getElementById('searchPageInput').value.trim(); if(v) location.href = `./search.html?q=${encodeURIComponent(v)}`; };
  renderCardGrid('searchResults', results);
}
async function renderArticlePage(){
  const id = param('id');
  await loadNews({ topic:'latest', limit:500, page:1, append:false });
  let article = allArticles.find(a => a.id === id) || getSavedArticles().find(a => a.id === id) || allArticles[0];
  if (!article) return;
  saveRecentlyViewed(article.id);
  setPageTitle(article.title);
  const mount = document.getElementById('articleRoot') || document.getElementById('articleBody') || document.querySelector('main') || document.body;
  mount.innerHTML = articleTemplate(article);
  renderCardGrid('relatedArticles', relatedArticles(article)); renderCardGrid('relatedStories', relatedArticles(article));
}

async function loadNews({ topic='latest', limit=120, page=1, append=false } = {}){
  if (isLoading) return;
  isLoading = true; setHTML('loadState','Loading stories…');
  try{
    const data = await getJSON(`${API.news}?topic=${encodeURIComponent(topic)}&limit=${limit}&page=${page}`);
    const items = normalizeArticles(data.articles || []);
    allArticles = append ? dedupe([...allArticles, ...items]) : dedupe(items);
    currentPage = data.nextPage || page + 1;
    hasMore = Boolean(data.hasMore);
    if (allArticles[0]?.publishedAt) { latestSeen = allArticles[0].publishedAt; localStorage.setItem('git-latest-seen', latestSeen); }
    saveArticles(allArticles);
  }catch(e){
    console.warn(e); allArticles = append ? allArticles : getSavedArticles();
    if (!allArticles.length) allArticles = fallbackArticles();
  }finally{ isLoading = false; setHTML('loadState', hasMore ? '' : ''); }
}

async function loadMore(containerId='moreNewsGrid', topic='latest'){
  if (!hasMore || isLoading) return;
  const before = allArticles.length;
  await loadNews({ topic, limit:120, page:currentPage, append:true });
  const fresh = allArticles.slice(before);
  if (fresh.length) appendCards(containerId, fresh);
}
function setupInfiniteScroll(containerId='moreNewsGrid', topic='latest'){
  if (!document.getElementById(containerId)) return;
  const sentinel = document.createElement('div'); sentinel.id = 'infiniteSentinel'; sentinel.className='load-state'; sentinel.textContent='Scroll for more stories';
  document.getElementById(containerId).after(sentinel);
  const io = new IntersectionObserver(entries => { if(entries[0].isIntersecting) loadMore(containerId, topic); }, { rootMargin:'700px' });
  io.observe(sentinel);
}
async function checkNewStories(){
  try{
    const data = await getJSON(`${API.news}?topic=latest&limit=40&since=${encodeURIComponent(latestSeen)}`);
    const newItems = normalizeArticles(data.articles || []).filter(a => !allArticles.some(x => x.id === a.id));
    if (newItems.length) showNewStoriesButton(newItems);
  }catch(e){ console.warn('new story check failed', e); }
}
function showNewStoriesButton(items){
  let btn = document.getElementById('newStoriesBtn');
  if (!btn) { btn = document.createElement('button'); btn.id='newStoriesBtn'; btn.className='new-stories-btn'; document.body.appendChild(btn); }
  btn.textContent = `${items.length} new stories available`;
  btn.onclick = () => { allArticles = dedupe([...items, ...allArticles]); saveArticles(allArticles); renderHero(); renderMoreNews(); renderSections(); renderTicker(); btn.remove(); scrollTo({top:0, behavior:'smooth'}); };
}

function renderHero(){
  const lead = allArticles[0] || fallbackArticles()[0], left = allArticles.slice(1,3), right = allArticles.slice(3,6);
  setHTML('leadMain', heroCard(lead, true));
  setHTML('leadLeft', left.map(a => heroCard(a)).join(''));
  setHTML('leadRight', right.map(a => heroCard(a)).join(''));
}
function renderMoreNews(){ renderCardGrid('moreNewsGrid', allArticles.slice(6,42)); }
function renderSections(){
  const sections = [ ['topStoriesSection','Top Stories','latest'], ['usSection','U.S.','us'], ['worldSection','World','world'], ['politicsSection','Politics','politics'], ['businessSection','Business','business'], ['marketsSection','Markets','markets'], ['aiSection','AI','artificial-intelligence'], ['technologySection','Technology','technology'], ['cryptoSection','Crypto','crypto'], ['weatherSection','Weather','weather'], ['healthSection','Health','health'], ['scienceSection','Science','science'], ['sportsSection','Sports','sports'], ['cultureSection','Culture','culture'], ['opinionSection','Opinion','opinion'] ];
  sections.forEach(([id,title,topic]) => renderSection(id, title, topic));
}
function renderSection(id, title, topic){
  const items = topic === 'latest' ? allArticles.slice(0,6) : allArticles.filter(a => articleText(a).includes(topic.replace('-', ' ')) || a.topic === topic || a.category === topic).slice(0,6);
  if (!items.length) { setHTML(id,''); return; }
  setHTML(id, `<div class="section-block"><div class="section-heading"><h2>${esc(title)}</h2><a href="./category.html?topic=${encodeURIComponent(topic)}">View All</a></div><div class="article-grid compact">${items.map(card).join('')}</div></div>`);
}
function renderSidebars(){
  setHTML('trendingStories', listLinks([...allArticles].sort((a,b)=>(b.trendingScore||0)-(a.trendingScore||0)).slice(0,10)));
  setHTML('mostRead', listLinks([...allArticles].sort((a,b)=>(b.importance||0)-(a.importance||0)).slice(0,10)));
  setHTML('latestUpdates', listLinks(allArticles.slice(0,12)));
  setHTML('newsletterBox', `<p>Get the global intelligence briefing.</p><a class="subscribe-button" href="./contact.html">Subscribe</a>`);
}
function renderTicker(){ setHTML('breakingTicker', allArticles.slice(0,12).map(a => `<a href="./article.html?id=${a.id}">${esc(a.title)}</a>`).join(' <span>•</span> ')); }
function renderCardGrid(id, items){ setHTML(id, items.map(card).join('') || '<p>No stories found.</p>'); }
function appendCards(id, items){ const el = document.getElementById(id); if (el) el.insertAdjacentHTML('beforeend', items.map(card).join('')); }

function card(a){
  return `<article class="news-card"><a href="./article.html?id=${a.id}" aria-label="${esc(a.title)}"><div class="thumb"><img loading="lazy" decoding="async" src="${esc(img(a.image))}" alt="${esc(a.title)}" onerror="this.src='${DEFAULT_IMG}'"></div><div class="card-body"><div class="kicker">${esc(a.section || a.category || 'Latest')}</div><h3>${esc(a.title)}</h3><p>${esc(a.summary || a.description || '')}</p><div class="meta"><span>${esc(a.source || 'Global Intel')}</span><span>${formatDate(a.publishedAt)}</span></div></div></a><button class="bookmark-btn" onclick="bookmark('${a.id}',event)">♡</button></article>`;
}
function heroCard(a, main=false){
  return `<article class="hero-card ${main?'main':''}"><a href="./article.html?id=${a.id}"><div class="thumb"><img loading="${main?'eager':'lazy'}" decoding="async" src="${esc(img(a.image))}" alt="${esc(a.title)}" onerror="this.src='${DEFAULT_IMG}'"></div><div class="card-body"><div class="kicker">${esc(a.section || 'Latest')}</div><h2>${esc(a.title)}</h2><p>${esc(a.summary || a.description || '')}</p><div class="meta"><span>${esc(a.source || '')}</span><span>${formatDate(a.publishedAt)}</span></div></div></a></article>`;
}
function articleTemplate(a){
  const body = cleanText(a.content || a.description || a.summary || '').split(/(?<=[.!?])\s+/).filter(Boolean).slice(0,8).map(p => `<p>${esc(p)}</p>`).join('');
  return `<article class="article-detail container"><div class="article-kicker">${esc(a.section || 'Latest')} · ${esc(a.source || 'Global Intel')}</div><h1>${esc(a.title)}</h1><div class="article-meta">${formatDate(a.publishedAt)} · ${readingTime(a.content || a.description)} min read · Risk ${esc(a.riskLevel || 'Low')}</div><img class="article-hero-image" src="${esc(img(a.image))}" alt="${esc(a.title)}" onerror="this.src='${DEFAULT_IMG}'"><div class="intel-summary"><h2>Intelligence Summary</h2><p>${esc(a.summary || a.description || '')}</p><div class="chips">${(a.tags||[]).slice(0,6).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><div class="article-content">${body}</div><a class="read-original" href="${esc(a.url || '#')}" target="_blank" rel="noopener">Continue reading at ${esc(a.source || 'source')}</a><section class="section-block"><div class="section-heading"><h2>Related Stories</h2></div><div id="relatedArticles" class="article-grid compact"></div></section></article>`;
}
function relatedArticles(a){ return allArticles.filter(x => x.id !== a.id && (x.category === a.category || x.country === a.country || (x.tags||[]).some(t => (a.tags||[]).includes(t)))).slice(0,6); }
function listLinks(items){ return items.map(a => `<a class="list-link" href="./article.html?id=${a.id}"><b>${esc(a.title)}</b><span>${esc(a.source || '')} · ${formatDate(a.publishedAt)}</span></a>`).join(''); }

async function loadWidgets(){
  Promise.allSettled([loadMarkets(), loadWeather(), loadCrypto(), loadIntel(), loadSports(), loadVideos(), loadAnalytics()]);
}
async function loadMarkets(){
  try{ const data = await getJSON(`${API.markets}?watchlist=${WATCH.join(',')}`); const quotes = data.quotes || data.items || []; renderMarkets(quotes.length ? quotes : fallbackMarkets()); }
  catch{ renderMarkets(fallbackMarkets()); }
}
function renderMarkets(quotes){
  setHTML('topMarketTicker', quotes[0] ? `${esc(quotes[0].symbol || 'AAPL')} ${Number(quotes[0].changePercent || quotes[0].dp || 0).toFixed(2)}% ${Number(quotes[0].changePercent || quotes[0].dp || 0)>=0?'↑':'↓'}` : 'Markets');
  setHTML('homeMarketBoard', quotes.slice(0,30).map(q => { const ch=Number(q.changePercent ?? q.dp ?? q.change ?? 0); return `<div class="quote ${ch<0?'down':'up'}"><b>${esc(q.symbol || q.ticker || '')}</b><span>${ch>=0?'+':''}${ch.toFixed(2)}%</span></div>`; }).join(''));
}
async function loadWeather(){ try{ const d = await getJSON(`${API.weather}?city=New York`); setHTML('weatherBox', `<h3>${esc(d.city || 'New York')}</h3><strong>${esc(d.temp || d.temperature || '72')}°</strong><p>${esc(d.condition || 'Live weather')}</p>`);} catch{ setHTML('weatherBox','<h3>New York</h3><strong>72°</strong><p>Weather fallback active</p>'); } }
async function loadCrypto(){ try{ const d=await getJSON(`${API.crypto}?coin=bitcoin`); const p=Number(d.price || d.bitcoin?.usd || 0); setHTML('cryptoBox', `<h3>Bitcoin</h3><strong>${p ? '$'+formatNumber(Math.round(p)) : 'Loading'}</strong><p>${esc(d.change24h || d.change || 'Live crypto')}</p>`);} catch{ setHTML('cryptoBox','<h3>Bitcoin</h3><strong>Live</strong><p>Crypto API fallback</p>'); } }
async function loadIntel(){
  try{ const [risk, eq, fire, conf] = await Promise.allSettled([getJSON(API.risk), getJSON(API.earthquakes), getJSON(API.wildfires), getJSON(API.conflicts)]);
    const riskData = risk.value || {}; setHTML('riskBox', `<strong>${esc(riskData.score || riskData.risk || 'Medium')}</strong><p>${esc(riskData.summary || 'Global risk from live intelligence feeds.')}</p>`);
    setHTML('earthquakeList', intelItems(eq.value?.items || eq.value?.earthquakes || []));
    setHTML('wildfireList', intelItems(fire.value?.items || fire.value?.wildfires || []));
    setHTML('conflictList', intelItems(conf.value?.items || conf.value?.conflicts || []));
  }catch(e){}
}
function intelItems(items){ return (items || []).slice(0,8).map(x => `<div class="intel-item"><span>${esc(x.level || x.severity || 'Low')}</span><b>${esc(x.title || x.place || x.name || 'Alert')}</b><p>${esc(x.summary || x.description || '')}</p></div>`).join('') || '<p>No live alerts right now.</p>'; }
async function loadSports(){ try{ const d=await getJSON(API.sports); setHTML('sportsStrip', (d.scores||d.items||[]).slice(0,6).map(s=>`<div><b>${esc(s.league||'Sports')}</b> ${esc(s.homeTeam||s.home||'Home')} ${esc(s.homeScore||'')} — ${esc(s.awayScore||'')} ${esc(s.awayTeam||s.away||'Away')}</div>`).join('')); } catch{} }
async function loadVideos(){ try{ const d=await getJSON(API.videos); setHTML('videoGrid', (d.videos||d.items||[]).slice(0,6).map(v=>`<a class="video-card" href="${esc(v.url||'#')}" target="_blank"><img loading="lazy" src="${esc(v.thumbnail||DEFAULT_IMG)}"><b>${esc(v.title||'Video')}</b></a>`).join('')); } catch{} }
async function loadAnalytics(){ try{ const d=await getJSON(API.analytics); setHTML('visitorAnalytics', `<strong>${formatNumber(d.live || d.visitors || 1516)}</strong><p>live readers now</p>`); } catch{ setHTML('visitorAnalytics','<strong>1,516</strong><p>live readers now</p>'); } }

function normalizeArticles(items){
  return items.map((a,i) => {
    const title = cleanText(a.title || `News Update ${i+1}`);
    const summary = cleanText(a.summary || a.description || 'This story is developing.');
    const section = cleanText(a.section || a.category || a.topic || detectTopic(`${title} ${summary}`));
    return { id: slugify(a.id || `${title}-${a.source||i}`), title, summary, description: summary, content: cleanText(a.content || summary), source: cleanText(a.source || a.author || 'Global Intel'), url: a.url || a.sourceUrl || '#', image: img(a.image || a.urlToImage || a.thumbnail), publishedAt: validDate(a.publishedAt), section, category: section.toLowerCase(), topic: section.toLowerCase(), country: a.country || 'Global', riskLevel: a.riskLevel || 'Low', riskScore: Number(a.riskScore || 0), importance: Number(a.importance || 0), trendingScore: Number(a.trendingScore || 0), tags: Array.isArray(a.tags) ? a.tags : [] };
  }).filter(a => a.title && a.id);
}
function cleanText(v){ return decode(String(v||'')).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function decode(s){ const t=document.createElement('textarea'); t.innerHTML=s; return t.value; }
function img(src){ if(!src) return DEFAULT_IMG; if(String(src).startsWith('/')) return src; if(String(src).startsWith('./')) return src; try{ const u = new URL(src); return ['http:','https:'].includes(u.protocol) ? u.toString() : DEFAULT_IMG; } catch { return DEFAULT_IMG; } }
function dedupe(list){ const seen = new Set(); return list.filter(a => { const k = slugify(a.title).slice(0,90); if(seen.has(k)) return false; seen.add(k); return true; }); }
function articleText(a){ return `${a.title} ${a.summary} ${a.section} ${a.country} ${(a.tags||[]).join(' ')}`.toLowerCase(); }
function detectTopic(text){ text = String(text||'').toLowerCase(); if(/ai|artificial intelligence|openai/.test(text)) return 'artificial-intelligence'; if(/market|stock|nasdaq|crypto|bitcoin|oil|gold/.test(text)) return 'markets'; if(/politics|election|president/.test(text)) return 'politics'; if(/tech|software|cyber/.test(text)) return 'technology'; if(/sport|nba|nfl|soccer|cricket/.test(text)) return 'sports'; if(/health|medical/.test(text)) return 'health'; if(/science|space|climate/.test(text)) return 'science'; if(/world|china|russia|ukraine|iran|israel/.test(text)) return 'world'; return 'latest'; }
function validDate(v){ const d=new Date(v); return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); }
function saveArticles(items){ try{ localStorage.setItem('git-articles-cache', JSON.stringify(items.slice(0,900))); }catch{} }
function getSavedArticles(){ try{ return JSON.parse(localStorage.getItem('git-articles-cache')||'[]'); }catch{return [];} }
function saveRecentlyViewed(id){ try{ const list=JSON.parse(localStorage.getItem('git-recent')||'[]'); localStorage.setItem('git-recent', JSON.stringify([id,...list.filter(x=>x!==id)].slice(0,50))); }catch{} }
window.bookmark = function(id,e){ e.preventDefault(); e.stopPropagation(); const list=JSON.parse(localStorage.getItem('git-bookmarks')||'[]'); if(!list.includes(id)) list.push(id); localStorage.setItem('git-bookmarks',JSON.stringify(list)); e.target.textContent='♥'; };
function fallbackArticles(){ return ['Global Leaders Weigh Diplomacy as Regional Tensions Continue','Markets Watch Technology Stocks as Investors Track Rates','AI Companies Prepare for New Global Rules','Extreme Weather Alerts Expand Across Regions','Scientists Track Climate Signals Across the Atlantic','Sports Fans Track Live Scores Across Major Leagues'].map((title,i)=>({ id:slugify(title), title, summary:'Fallback story shown only when live APIs are unavailable.', content:'This story is developing.', source:'Global Intel', image:DEFAULT_IMG, publishedAt:new Date(Date.now()-i*3600000).toISOString(), section:i%2?'Markets':'World', category:'latest', topic:'latest', tags:[], riskLevel:'Low', importance:20 })); }
function fallbackMarkets(){ return WATCH.slice(0,24).map((s,i)=>({symbol:s, changePercent: ((i%7)-3)/2 })); }

function renderNav(){ const nav=document.getElementById('megaNav'); if(!nav) return; nav.innerHTML=Object.keys(TOP_MENU).map(n=>`<a href="./category.html?topic=${slugify(n)}">${esc(n)}⌄</a>`).join(''); }
function initTheme(){ const b=document.getElementById('themeToggle'); if(localStorage.getItem('git-theme')==='dark') document.body.classList.add('dark'); if(b) b.onclick=()=>{document.body.classList.toggle('dark'); localStorage.setItem('git-theme', document.body.classList.contains('dark')?'dark':'light');}; }
function initSearch(){ const overlay=document.getElementById('searchOverlay'), open=document.getElementById('searchOpenBtn'), close=document.getElementById('searchCloseBtn'), input=document.getElementById('globalSearchInput'); if(open&&overlay) open.onclick=()=>overlay.classList.add('active'); if(close&&overlay) close.onclick=()=>overlay.classList.remove('active'); if(input) input.onkeydown=e=>{ if(e.key==='Enter' && input.value.trim()) location.href=`./search.html?q=${encodeURIComponent(input.value.trim())}`; }; }
function initScroll(){ const bar=document.getElementById('readingProgress'), top=document.getElementById('scrollTopBtn'); addEventListener('scroll',()=>{ if(bar){ const h=document.body.scrollHeight-innerHeight; bar.style.width=(h>0?scrollY/h*100:0)+'%'; } if(top) top.classList.toggle('show', scrollY>600); }); if(top) top.onclick=()=>scrollTo({top:0,behavior:'smooth'}); }
async function getJSON(url){ const r=await fetch(url, { headers:{ accept:'application/json' } }); if(!r.ok) throw new Error(`${url} ${r.status}`); return r.json(); }
function param(n){ return new URLSearchParams(location.search).get(n); }
function setHTML(id,html){ const el=document.getElementById(id); if(el) el.innerHTML=html || ''; }
function setText(id,text){ const el=document.getElementById(id); if(el) el.textContent=text || ''; }
function setPageTitle(t){ document.title = `${t} | ${SITE_NAME}`; }
function esc(v){ return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function slugify(v){ return String(v||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120) || 'story'; }
function titleCase(v){ return String(v||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
function formatDate(v){ return new Date(v||Date.now()).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
function formatNumber(v){ return Number(v||0).toLocaleString('en-US'); }
function readingTime(v){ return Math.max(1, Math.ceil(String(v||'').split(/\s+/).length/220)); }
