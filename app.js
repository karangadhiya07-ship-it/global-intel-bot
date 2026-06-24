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

const topicPool = [
  "bitcoin",
  "artificial intelligence",
  "stock market",
  "tesla",
  "apple",
  "nvidia",
  "microsoft",
  "gold price",
  "silver price",
  "crypto"
];
const marketItems = [
  { name:"Apple", symbol:"AAPL", change:"+1.24%", trend:"up" },
  { name:"Microsoft", symbol:"MSFT", change:"+0.82%", trend:"up" },
  { name:"Nvidia", symbol:"NVDA", change:"+2.31%", trend:"up" },
  { name:"Amazon", symbol:"AMZN", change:"-0.44%", trend:"down" },
  { name:"Meta", symbol:"META", change:"+1.09%", trend:"up" },
  { name:"Tesla", symbol:"TSLA", change:"-1.76%", trend:"down" },
  { name:"Google", symbol:"GOOGL", change:"+0.55%", trend:"up" },
  { name:"Netflix", symbol:"NFLX", change:"-0.69%", trend:"down" },
  { name:"JPMorgan", symbol:"JPM", change:"+0.28%", trend:"up" },
  { name:"Walmart", symbol:"WMT", change:"+0.39%", trend:"up" },
  { name:"Gold", symbol:"GOLD", change:"+0.61%", trend:"up" },
  { name:"Silver", symbol:"SILVER", change:"-0.22%", trend:"down" },
  { name:"Crude Oil", symbol:"OIL", change:"+1.18%", trend:"up" },
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

function detectSection(title){
  const t = String(title || "").toLowerCase();

  if(t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")) return "Crypto";
  if(t.includes("stock") || t.includes("market") || t.includes("economy") || t.includes("fed") || t.includes("nasdaq")) return "Business";
  if(t.includes("ai") || t.includes("openai") || t.includes("technology") || t.includes("tech")) return "Technology";
  if(t.includes("weather") || t.includes("storm") || t.includes("heatwave") || t.includes("rain")) return "Weather";
  if(t.includes("sport") || t.includes("nfl") || t.includes("nba") || t.includes("world cup") || t.includes("fifa")) return "Sports";
  if(t.includes("music") || t.includes("movie") || t.includes("celebrity")) return "Culture";

  return "News";
}

function cleanText(text){
  if(!text || text === "undefined"){
    return "This story is developing and more updates may follow soon.";
  }

  return String(text)
    .replace("NEW", "")
    .replace("You can now listen to Fox News articles!", "")
    .replace(/\[\.\.\.\]/g, "")
    .replace(/The post .* appeared first on .*?\./gi, "")
    .trim();
}

function shortText(text, limit = 180){
  const clean = cleanText(text);
  return clean.length > limit ? clean.slice(0, limit) + "..." : clean;
}

function createArticleCard(item){
  const id = allNews.indexOf(item);

  const image =
    item.image &&
    item.image.startsWith("http")
      ? item.image
      : "https://placehold.co/800x450?text=Global+Intel+Times";

  const badImages = [
    "benzinga",
    "logo",
    "placeholder",
    "default"
  ];

  const finalImage =
    badImages.some(x => image.toLowerCase().includes(x))
      ? "https://placehold.co/800x450?text=Global+Intel+Times"
      : image;

  return `
    <div class="news-card clickable-card"
         onclick="window.location.href='./article.html?id=${id}'">

      <img
        src="${finalImage}"
        onerror="this.src='https://placehold.co/800x450?text=Global+Intel+Times'"
        alt="news image">

      <span class="section-label">${item.section || "NEWS"}</span>

      <h2>${item.title}</h2>

      <p>${shortText(item.description || "", 190)}</p>

      <small>Source: ${item.source || item.source_id || "Global Intel Times"}</small>
    </div>
  `;
}


function createSmallVideoCard(index){
  const item = allNews[index + 3];
  const title = item?.title || "Latest Video Brief";

  return `
    <article class="news-card video-news-card">
      <div class="video-thumb">
        <span>▶</span>
      </div>

      <span class="section-label">VIDEO</span>
      <h2>${title}</h2>
      <p>Watch related video coverage for this story.</p>

      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(title)}" target="_blank">
        Watch video ›
      </a>
    </article>
  `;
}

function renderLeads(){
  if(leadLeft) leadLeft.innerHTML = allNews[0] ? createArticleCard(allNews[0]) : "";
  if(leadMain) leadMain.innerHTML = allNews[1] ? createArticleCard(allNews[1]) : "";
  if(leadRight) leadRight.innerHTML = allNews[2] ? createArticleCard(allNews[2]) : "";
}

function renderBelowNews(){
  if(!newsFeed) return;

  newsFeed.innerHTML = "";

  allNews.slice(3).forEach((item, index)=>{
    if(index > 0 && index % 6 === 0){
      newsFeed.insertAdjacentHTML("beforeend", createSmallVideoCard(index));
    }

    const article = document.createElement("article");
    article.className = "news-card";
    article.innerHTML = createArticleCard(item);
    newsFeed.appendChild(article);
  });

  localStorage.setItem("articles", JSON.stringify(allNews));
}

function updateTicker(){
  if(!breakingTicker) return;

  if(!allNews.length){
    breakingTicker.textContent = "LIVE • Loading latest updates...";
    return;
  }

  breakingTicker.textContent =
    "LIVE • " + allNews.slice(0,8).map(item=>item.title).join(" • ");
}

function updateMostRead(){
  if(!mostReadList) return;

  mostReadList.innerHTML = allNews
    .slice(0,8)
    .map((item, i)=>`
      <li><a href="./article.html?id=${i}">${item.title}</a></li>
    `)
    .join("");
}

function updateTrendAnalysis(){
  const box = document.getElementById("trendAnalysis");
  if(!box) return;

  const crypto = allNews.filter(x => x.section === "Crypto").length;
  const ai = allNews.filter(x => x.section === "Technology").length;
  const finance = allNews.filter(x => x.section === "Business").length;
  const weather = allNews.filter(x => x.section === "Weather").length;
  const normalNews = allNews.filter(x => x.section === "News").length;

  const total = allNews.length;
  const trendingScore = Math.min(
    100,
    crypto * 12 + ai * 10 + finance * 9 + weather * 6 + total * 2
  );

  const counts = {
    Crypto: crypto,
    Technology: ai,
    Business: finance,
    Weather: weather,
    News: normalNews
  };

  const topCategory = Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];

  box.innerHTML = `
    <p><b>Trending Score:</b> ${trendingScore}/100</p>
    <p><b>Top Category:</b> ${topCategory}</p>
    <p><b>Total Headlines:</b> ${allNews.length}</p>
    <p><b>Crypto Mentions:</b> ${crypto}</p>
    <p><b>AI Mentions:</b> ${ai}</p>
    <p><b>Finance Mentions:</b> ${finance}</p>
    <p><b>Weather Mentions:</b> ${weather}</p>
  `;
}

function updateTopMarket(){
  const box = document.getElementById("topTrendBox");
  if(!box || !searchBox) return;

  const search = searchBox.value.trim().toLowerCase();

  const found = marketItems.find(item =>
    item.name.toLowerCase().includes(search) ||
    item.symbol.toLowerCase().includes(search)
  );

  const item = search && found
    ? found
    : marketItems[marketIndex % marketItems.length];

  box.className = "top-trend-box " + item.trend;
  box.innerHTML = `${item.symbol} ${item.change} ${item.trend === "up" ? "↑" : "↓"}`;

  if(!search){
    marketIndex++;
  }
}

function renderPage(){
  localStorage.setItem("articles", JSON.stringify(allNews));
  renderLeads();
  renderBelowNews();
  updateTicker();
  updateMostRead();
  updateTrendAnalysis();
  updateTopMarket();
  enhanceImages();
}

async function fetchNews(topic){
  if(isLoading || !newsFeed) return;

  isLoading = true;

  const loading = document.createElement("div");
  loading.className = "loading";
  loading.textContent = "Loading more stories...";
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

    console.log("API DATA:", data);
console.log("RESULTS:", data.results);
console.log("TOTAL:", data.results?.length);

    console.log(JSON.stringify(data));

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
      const title = (item.title || "").trim();
      const cleanTitle = title.toLowerCase();

      if(title && !seenTitles.has(cleanTitle)){
        seenTitles.add(cleanTitle);

        fresh.push({
          title,
          description: item.description || item.content || item.summary || "",
          section: detectSection(title),
          source: item.source_id || item.source_name || "GNews",
          link: item.link || "#",
          image: item.image_url || item.image || ""
        });
      }
    });

    allNews = allNews.concat(fresh);

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

await fetchNews(searchBox?.value.trim() || "bitcoin");
}

window.addEventListener("scroll", ()=>{
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 700;

  if(nearBottom){
    const nextTopic = topicPool[topicIndex % topicPool.length];
    fetchNews(nextTopic);
  }
});

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
searchNews();
function acceptCookies(){
  localStorage.setItem("cookiesAccepted","yes");
  document.getElementById("cookieBanner").style.display="none";
}

window.addEventListener("load",()=>{
  if(localStorage.getItem("cookiesAccepted")==="yes"){
    const banner=document.getElementById("cookieBanner");
    if(banner) banner.style.display="none";
  }
});
setTimeout(()=>{
  const popup=document.getElementById("breakingPopup");

  if(popup){
    popup.style.display="block";
  }
},5000);
function acceptCookies(){
  localStorage.setItem("cookiesAccepted","yes");

  const banner = document.getElementById("cookieBanner");
  if(banner){
    banner.style.display = "none";
  }
}

function setupCookieBanner(){
  const banner = document.getElementById("cookieBanner");

  if(!banner) return;

  if(localStorage.getItem("cookiesAccepted") === "yes"){
    banner.style.display = "none";
  }else{
    banner.style.display = "flex";
  }
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

function setupMegaFeatures(){
  setupCookieBanner();
  setupNewsletter();
  setupKeyboardSearch();

  setTimeout(()=>{
    setupBreakingPopup();
    enhanceImages();
  },1500);
}

setupMegaFeatures();
function trackArticleClick(title){
  const clicks = JSON.parse(localStorage.getItem("articleClicks") || "{}");
  clicks[title] = (clicks[title] || 0) + 1;
  localStorage.setItem("articleClicks", JSON.stringify(clicks));
}

function getMostClickedArticles(){
  const clicks = JSON.parse(localStorage.getItem("articleClicks") || "{}");

  return Object.entries(clicks)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10);
}

function updateVisitorCount(){
  const today = new Date().toDateString();
  const key = "visitorCount_" + today;

  let count = Number(localStorage.getItem(key) || 0);
  count++;

  localStorage.setItem(key, count);

  const box = document.getElementById("visitorCounter");
  if(box){
    box.textContent = count + " visits today";
  }
}

function setupSearchAnalytics(){
  if(!searchBox) return;

  const originalSearchNews = searchNews;

  window.searchNews = async function(){
    const term = searchBox.value.trim();

    if(term){
      const searches = JSON.parse(localStorage.getItem("searchAnalytics") || "[]");
      searches.push({
        term,
        time:new Date().toISOString()
      });
      localStorage.setItem("searchAnalytics", JSON.stringify(searches));
    }

    await originalSearchNews();
  };
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

function setupProFeatures(){
  updateVisitorCount();
  setupSearchAnalytics();
  showTrendingKeywords();
}

setupProFeatures();
