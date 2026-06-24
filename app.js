const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const category = document.getElementById("category");

const breakingTicker = document.getElementById("breakingTicker");
const newsFeed = document.getElementById("newsFeed");
const leadLeft = document.getElementById("leadLeft");
const leadMain = document.getElementById("leadMain");
const leadRight = document.getElementById("leadRight");
const todayDate = document.getElementById("todayDate");
const mostReadList = document.getElementById("mostReadList");

let allNews = [];
let seenTitles = new Set();
let isLoading = false;
let topicIndex = 0;
let marketIndex = 0;

const MAX_HOME_ARTICLES = 30;

const topicPool = [
  "usa news",
  "breaking news",
  "stock market",
  "artificial intelligence",
  "bitcoin",
  "new york",
  "technology",
  "business",
  "weather",
  "sports"
];

const marketItems = [
  { name:"Apple", symbol:"AAPL", change:"+1.24%", trend:"up" },
  { name:"Microsoft", symbol:"MSFT", change:"+0.82%", trend:"up" },
  { name:"Nvidia", symbol:"NVDA", change:"+2.31%", trend:"up" },
  { name:"Amazon", symbol:"AMZN", change:"-0.44%", trend:"down" },
  { name:"Meta", symbol:"META", change:"+1.09%", trend:"up" },
  { name:"Tesla", symbol:"TSLA", change:"-1.76%", trend:"down" },
  { name:"Google", symbol:"GOOGL", change:"+0.55%", trend:"up" },
  { name:"Bitcoin", symbol:"BTC", change:"+2.14%", trend:"up" }
];

if(todayDate){
  todayDate.textContent = new Date().toLocaleDateString("en-US", {
    weekday:"long",
    year:"numeric",
    month:"long",
    day:"numeric"
  });
}

function cleanText(text){
  if(!text || text === "undefined"){
    return "This story is developing and more updates may follow soon.";
  }

  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace("NEW", "")
    .replace("You can now listen to Fox News articles!", "")
    .replace(/\[\.\.\.\]/g, "")
    .replace(/The post .* appeared first on .*?\./gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(text, limit = 180){
  const clean = cleanText(text);
  return clean.length > limit ? clean.slice(0, limit) + "..." : clean;
}

function detectSection(title){
  const t = String(title || "").toLowerCase();

  if(t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")) return "Crypto";
  if(t.includes("stock") || t.includes("market") || t.includes("economy") || t.includes("fed") || t.includes("nasdaq")) return "Business";
  if(t.includes("ai") || t.includes("openai") || t.includes("technology") || t.includes("tech")) return "Technology";
  if(t.includes("weather") || t.includes("storm") || t.includes("heatwave") || t.includes("rain")) return "Weather";
  if(t.includes("sport") || t.includes("nfl") || t.includes("nba") || t.includes("world cup") || t.includes("fifa")) return "Sports";
  if(t.includes("music") || t.includes("movie") || t.includes("celebrity")) return "Culture";
  if(t.includes("new york") || t.includes("nyc")) return "New York";

  return "News";
}

function getValidImage(item){
  const img = item.image || "";

  if(
    img &&
    img.startsWith("http") &&
    !img.toLowerCase().includes("logo") &&
    !img.toLowerCase().includes("placeholder") &&
    !img.toLowerCase().includes("default") &&
    !img.toLowerCase().includes("benzinga")
  ){
    return img;
  }

  return "";
}

function articleUrl(id){
  return `./article.html?id=${id}`;
}

function createArticleCard(item){
  const id = allNews.indexOf(item);
  const img = getValidImage(item);

  return `
    <article class="news-card clickable-card ${!img ? "no-image-card" : ""}">
      <a href="${articleUrl(id)}" onclick="trackArticleClick('${item.title.replace(/'/g, "")}')">
        ${img ? `
          <img
            loading="lazy"
            src="${img}"
            onerror="this.remove()"
            alt="${item.title}">
        ` : ""}

        <span class="section-label">${item.section || "NEWS"}</span>

        <h2>${item.title}</h2>

        <p>${shortText(item.description || "", 190)}</p>

        <small>Source: ${item.source || "Global Intel Times"}</small>

        <div class="read-more-btn">Read Full Story →</div>
      </a>
    </article>
  `;
}

function createSmallVideoCard(index){
  const item = allNews[index + 3];
  const title = item?.title || "Latest Video Brief";

  return `
    <article class="news-card video-news-card">
      <div class="video-thumb"><span>▶</span></div>
      <span class="section-label">VIDEO</span>
      <h2>${title}</h2>
      <p>Watch related video coverage for this story.</p>
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(title)}" target="_blank">
        Watch video ›
      </a>
    </article>
  `;
}

function limitHomepageArticles(){
  allNews = allNews.slice(0, MAX_HOME_ARTICLES);
}

function renderLeads(){
  if(leadLeft) leadLeft.innerHTML = allNews[0] ? createArticleCard(allNews[0]) : "";
  if(leadMain) leadMain.innerHTML = allNews[1] ? createArticleCard(allNews[1]) : "";
  if(leadRight) leadRight.innerHTML = allNews[2] ? createArticleCard(allNews[2]) : "";
}

function renderBelowNews(){
  if(!newsFeed) return;

  newsFeed.innerHTML = "";

  allNews.slice(3, MAX_HOME_ARTICLES).forEach((item, index)=>{
    if(index > 0 && index % 6 === 0){
      newsFeed.insertAdjacentHTML("beforeend", createSmallVideoCard(index));
    }

    newsFeed.insertAdjacentHTML("beforeend", createArticleCard(item));
  });

  localStorage.setItem("articles", JSON.stringify(allNews));
}

function updateTicker(){
  if(!breakingTicker) return;

  breakingTicker.textContent = allNews.length
    ? "LIVE • " + allNews.slice(0,8).map(item=>item.title).join(" • ")
    : "LIVE • Loading latest updates...";
}

function updateMostRead(){
  if(!mostReadList) return;

  mostReadList.innerHTML = allNews
    .slice(0,8)
    .map((item, i)=>`<li><a href="${articleUrl(i)}">${item.title}</a></li>`)
    .join("");
}

function updateTrendAnalysis(){
  const box = document.getElementById("trendAnalysis");
  if(!box) return;

  const counts = {
    Crypto: allNews.filter(x => x.section === "Crypto").length,
    Technology: allNews.filter(x => x.section === "Technology").length,
    Business: allNews.filter(x => x.section === "Business").length,
    Weather: allNews.filter(x => x.section === "Weather").length,
    News: allNews.filter(x => x.section === "News").length
  };

  const topCategory = Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];

  const trendingScore = Math.min(
    100,
    counts.Crypto * 12 +
    counts.Technology * 10 +
    counts.Business * 9 +
    counts.Weather * 6 +
    allNews.length * 2
  );

  box.innerHTML = `
    <p><b>Trending Score:</b> ${trendingScore}/100</p>
    <p><b>Top Category:</b> ${topCategory}</p>
    <p><b>Total Headlines:</b> ${allNews.length}</p>
    <p><b>Crypto Mentions:</b> ${counts.Crypto}</p>
    <p><b>AI Mentions:</b> ${counts.Technology}</p>
    <p><b>Finance Mentions:</b> ${counts.Business}</p>
    <p><b>Weather Mentions:</b> ${counts.Weather}</p>
  `;
}

function latestUpdatesWidget(){
  const box = document.getElementById("latestUpdatesBox");
  if(!box) return;

  box.innerHTML = allNews
    .slice(0,5)
    .map((item, i)=>`<a class="latest-update-link" href="${articleUrl(i)}">${item.title}</a>`)
    .join("");
}

function updateTopMarket(){
  const box = document.getElementById("topTrendBox");
  if(!box) return;

  const search = searchBox?.value.trim().toLowerCase() || "";

  const found = marketItems.find(item =>
    item.name.toLowerCase().includes(search) ||
    item.symbol.toLowerCase().includes(search)
  );

  const item = search && found ? found : marketItems[marketIndex % marketItems.length];

  box.className = "top-trend-box " + item.trend;
  box.innerHTML = `${item.symbol} ${item.change} ${item.trend === "up" ? "↑" : "↓"}`;

  if(!search) marketIndex++;
}

function renderPage(){
  limitHomepageArticles();

  localStorage.setItem("articles", JSON.stringify(allNews));

  renderLeads();
  renderBelowNews();
  updateTicker();
  updateMostRead();
  updateTrendAnalysis();
  latestUpdatesWidget();
  updateTopMarket();
  enhanceImages();
}

async function fetchNews(topic){
  if(isLoading || !newsFeed) return;

  isLoading = true;

  const loading = document.createElement("div");
  loading.className = "loading";
  loading.textContent = "Loading latest stories...";
  newsFeed.appendChild(loading);

  const finalTopic =
    topic ||
    searchBox?.value.trim() ||
    category?.value ||
    topicPool[topicIndex % topicPool.length];

  topicIndex++;

  try{
    const response = await fetch(
      `${window.location.origin}/api/news?q=${encodeURIComponent(finalTopic)}`
    );

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];

    loading.remove();

    if(results.length === 0){
      if(allNews.length === 0){
        newsFeed.innerHTML = `<div class="loading">No news found. Try another topic.</div>`;
      }
      isLoading = false;
      return;
    }

    const fresh = [];

    results.forEach(item=>{
      const title = cleanText(item.title || "");
      const cleanTitle = title.toLowerCase();

      if(title && !seenTitles.has(cleanTitle)){
        seenTitles.add(cleanTitle);

        fresh.push({
          title,
          description: cleanText(item.description || item.content || item.summary || ""),
          section: detectSection(title),
          source: item.source_id || item.source || "News",
          link: item.link || item.url || "#",
          image: item.image_url || item.image || "",
          publishedAt: item.pubDate || item.publishedAt || item.published_at || new Date().toISOString()
        });
      }
    });

    allNews = allNews.concat(fresh).slice(0, MAX_HOME_ARTICLES);

    if(allNews.length === 0){
      newsFeed.innerHTML = `<div class="loading">No fresh news found. Try another topic.</div>`;
    }else{
      renderPage();
    }

  }catch(error){
    console.error(error);
    loading.textContent = "Failed to load stories.";
  }

  isLoading = false;
}

async function searchNews(){
  allNews = [];
  seenTitles = new Set();
  topicIndex = 0;

  if(leadLeft) leadLeft.innerHTML = "";
  if(leadMain) leadMain.innerHTML = "";
  if(leadRight) leadRight.innerHTML = "";
  if(newsFeed) newsFeed.innerHTML = `<div class="loading">Loading live news...</div>`;
  if(mostReadList) mostReadList.innerHTML = `<li>Loading...</li>`;

  await fetchNews(searchBox?.value.trim() || category?.value || "usa news");
}

function updateArticleSEO(article){
  document.title = `${article.title} | Global Intel Times`;

  const desc = article.description || article.title;

  const descriptionTag = document.querySelector('meta[name="description"]');
  if(descriptionTag) descriptionTag.setAttribute("content", desc);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if(ogTitle) ogTitle.setAttribute("content", article.title);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if(ogDescription) ogDescription.setAttribute("content", desc);

  const ogImage = document.querySelector('meta[property="og:image"]');
  if(ogImage && article.image) ogImage.setAttribute("content", article.image);

  const schema = document.getElementById("articleSchema");
  if(schema){
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": desc,
      "image": article.image || "https://globalinteltimes.com/og-image.jpg",
      "datePublished": article.publishedAt || new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "Global Intel Times"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Global Intel Times",
        "logo": {
          "@type": "ImageObject",
          "url": "https://globalinteltimes.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    });
  }
}

function readingTime(text){
  const words = cleanText(text).split(" ").length;
  const mins = Math.max(1, Math.ceil(words / 220));
  return `${mins} min read`;
}

function renderArticlePage(){
  const articleBox = document.getElementById("articleView");
  if(!articleBox) return;

  const articles = JSON.parse(localStorage.getItem("articles") || "[]");
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id") || 0);
  const article = articles[id];

  if(!article){
    articleBox.innerHTML = `
      <h1>Article not found</h1>
      <p>Please go back to the homepage and open a story again.</p>
      <a href="./index.html" class="read-more-btn">Back to Home</a>
    `;
    return;
  }

  updateArticleSEO(article);

  const img = getValidImage(article);

  articleBox.innerHTML = `
    <span class="section-label">${article.section}</span>
    <h1>${article.title}</h1>

    <p class="article-meta">
      ${article.source || "Global Intel Times"} •
      ${article.publishedAt ? new Date(article.publishedAt).toLocaleString("en-US") : "Latest update"} •
      ${readingTime(article.description)}
    </p>

    ${img ? `<img class="article-main-img" src="${img}" alt="${article.title}" onerror="this.remove()">` : ""}

    <p class="article-intro">${article.description}</p>

    <p>
      This developing story is being tracked by Global Intel Times as part of our USA-focused news coverage.
      More context, market reaction and official updates may follow as the situation develops.
    </p>

    ${article.link && article.link !== "#" ? `
      <a href="${article.link}" target="_blank" rel="noopener nofollow" class="source-link">
        Original Source
      </a>
    ` : ""}

    <div class="share-box">
      <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}">Facebook</a>
      <a target="_blank" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(article.title)}">X</a>
      <a target="_blank" href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " " + location.href)}">WhatsApp</a>
    </div>
  `;

  renderRelatedArticles(article, id, articles);
}

function renderRelatedArticles(currentArticle, currentId, articles){
  const box = document.getElementById("relatedArticles") || document.getElementById("relatedGrid");
  if(!box) return;

  let related = articles
    .map((item, index)=>({ ...item, realIndex:index }))
    .filter(item => item.realIndex !== currentId && item.section === currentArticle.section)
    .slice(0,6);

  if(related.length < 3){
    related = articles
      .map((item, index)=>({ ...item, realIndex:index }))
      .filter(item => item.realIndex !== currentId)
      .slice(0,6);
  }

  box.innerHTML = related.map(item => `
    <a class="related-card news-card" href="./article.html?id=${item.realIndex}">
      ${getValidImage(item) ? `<img loading="lazy" src="${getValidImage(item)}" alt="${item.title}" onerror="this.remove()">` : ""}
      <span class="section-label">${item.section}</span>
      <h3>${item.title}</h3>
      <p>${shortText(item.description, 120)}</p>
    </a>
  `).join("");
}

function acceptCookies(){
  localStorage.setItem("cookiesAccepted","yes");

  const banner = document.getElementById("cookieBanner");
  if(banner) banner.style.display = "none";
}

function setupCookieBanner(){
  const banner = document.getElementById("cookieBanner");
  if(!banner) return;

  banner.style.display =
    localStorage.getItem("cookiesAccepted") === "yes" ? "none" : "flex";
}

function setupBreakingPopup(){
  const popup = document.getElementById("breakingPopup");
  if(!popup) return;

  popup.style.display = "none";

  setTimeout(()=>{
    if(allNews.length > 0){
      popup.textContent = "🚨 " + allNews[0].title;
      popup.style.display = "block";

      popup.onclick = ()=>{
        window.location.href = "./article.html?id=0";
      };

      setTimeout(()=>{
        popup.style.display = "none";
      },8000);
    }
  },6000);
}

function setupNewsletter(){
  const input = document.querySelector(".newsletter-input");
  const btn = document.querySelector(".newsletter-btn");

  if(!input || !btn) return;

  btn.addEventListener("click", ()=>{
    const email = input.value.trim();

    if(!email || !email.includes("@")){
      alert("Please enter a valid email.");
      return;
    }

    const savedEmails = JSON.parse(localStorage.getItem("newsletterEmails") || "[]");

    if(!savedEmails.includes(email)){
      savedEmails.push(email);
      localStorage.setItem("newsletterEmails", JSON.stringify(savedEmails));
    }

    input.value = "";
    alert("Thanks for subscribing!");
  });
}

function enhanceImages(){
  document.querySelectorAll("img").forEach(img=>{
    img.setAttribute("loading","lazy");
    img.setAttribute("decoding","async");
  });
}

function setupKeyboardSearch(){
  document.addEventListener("keydown", e=>{
    if(e.key === "/" && searchBox){
      e.preventDefault();
      searchBox.focus();
    }
  });
}

function trackArticleClick(title){
  const clicks = JSON.parse(localStorage.getItem("articleClicks") || "{}");
  clicks[title] = (clicks[title] || 0) + 1;
  localStorage.setItem("articleClicks", JSON.stringify(clicks));
}

function updateVisitorCount(){
  const today = new Date().toDateString();
  const key = "visitorCount_" + today;

  let count = Number(localStorage.getItem(key) || 0);
  count++;

  localStorage.setItem(key, count);

  const box = document.getElementById("visitorCounter");
  if(box) box.textContent = count + " visits today";
}

function showTrendingKeywords(){
  const searches = JSON.parse(localStorage.getItem("searchAnalytics") || "[]");
  const box = document.getElementById("trendingKeywords");
  if(!box) return;

  const counts = {};

  searches.forEach(item=>{
    counts[item.term] = (counts[item.term] || 0) + 1;
  });

  const top = Object.entries(counts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  box.innerHTML = top.length
    ? top.map(item=>`<p>${item[0]}</p>`).join("")
    : "<p>No searches yet</p>";
}

function setupSearchAnalytics(){
  if(!searchBtn || !searchBox) return;

  searchBtn.addEventListener("click", ()=>{
    const term = searchBox.value.trim();

    if(term){
      const searches = JSON.parse(localStorage.getItem("searchAnalytics") || "[]");
      searches.push({
        term,
        time:new Date().toISOString()
      });
      localStorage.setItem("searchAnalytics", JSON.stringify(searches));
    }
  });
}

function setupProFeatures(){
  setupCookieBanner();
  setupNewsletter();
  setupKeyboardSearch();
  setupSearchAnalytics();
  updateVisitorCount();
  showTrendingKeywords();

  setTimeout(()=>{
    setupBreakingPopup();
    enhanceImages();
  },1500);
}

if(searchBtn){
  searchBtn.addEventListener("click", searchNews);
}

if(searchBox){
  searchBox.addEventListener("keydown", e=>{
    if(e.key === "Enter") searchNews();
  });

  searchBox.addEventListener("input", updateTopMarket);
}

document.querySelectorAll(".topicBtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if(searchBox) searchBox.value = btn.dataset.topic;
    searchNews();
  });
});

setInterval(updateTopMarket, 5000);

updateTopMarket();
setupProFeatures();

if(document.getElementById("articleView")){
  renderArticlePage();
}else{
  searchNews();
}
