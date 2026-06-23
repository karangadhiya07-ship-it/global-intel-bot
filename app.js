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

const topicPool = [
  "usa breaking news",
  "world breaking news",
  "stock market finance news",
  "artificial intelligence news",
  "bitcoin crypto news",
  "sports news usa",
  "weather alert news",
  "entertainment news usa",
  "technology news usa",
  "new york news"
];

todayDate.textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

function detectSection(title){
  const t = title.toLowerCase();
  if(t.includes("bitcoin") || t.includes("crypto")) return "Crypto";
  if(t.includes("stock") || t.includes("market") || t.includes("economy") || t.includes("fed")) return "Business";
  if(t.includes("ai") || t.includes("openai") || t.includes("technology")) return "Technology";
  if(t.includes("weather") || t.includes("storm") || t.includes("heatwave")) return "Weather";
  if(t.includes("sport") || t.includes("nfl") || t.includes("nba") || t.includes("world cup")) return "Sports";
  if(t.includes("music") || t.includes("movie") || t.includes("celebrity")) return "Culture";
  return "News";
}

function cleanText(text){
  if(!text || text === "undefined") return "This story is developing and more updates may follow soon.";
  return String(text)
    .replace("NEW", "")
    .replace("You can now listen to Fox News articles!", "")
    .replace(/\[\.\.\.\]/g, "")
    .replace(/The post .* appeared first on .*?\./gi, "")
    .trim();
}

function createArticleCard(item){
  const id = allNews.indexOf(item);
  return `
    ${item.image ? `<img src="${item.image}" onerror="this.style.display='none'" alt="news image">` : ""}
    <span class="section-label">${item.section}</span>
    <h2>${item.title}</h2>
    <p>${cleanText(item.description)}</p>
    <small>Source: ${item.source}</small><br>
    <a href="./article.html?id=${id}">Read more ›</a>
  `;
}

function renderLeads(){
  leadLeft.innerHTML = allNews[0] ? createArticleCard(allNews[0]) : "";
  leadMain.innerHTML = allNews[1] ? createArticleCard(allNews[1]) : "";
  leadRight.innerHTML = allNews[2] ? createArticleCard(allNews[2]) : "";
}

function renderBelowNews(){
  newsFeed.innerHTML = "";

  allNews.slice(3).forEach(item=>{
    const article = document.createElement("article");
    article.className = "news-card";
    article.innerHTML = createArticleCard(item);
    newsFeed.appendChild(article);
  });

  localStorage.setItem("articles", JSON.stringify(allNews));
}

function updateTicker(){
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
      <li>
        <a href="./article.html?id=${i}">
          ${item.title}
        </a>
      </li>
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

  const total = allNews.length || 1;

  const trendingScore = Math.min(
    100,
    crypto * 12 + ai * 10 + finance * 9 + weather * 6 + total * 2
  );

  const counts = {
    Crypto: crypto,
    Technology: ai,
    Business: finance,
    Weather: weather
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

function renderPage(){
  localStorage.setItem("articles", JSON.stringify(allNews));
  renderLeads();
  renderBelowNews();
  updateTicker();
  updateMostRead();
  updateTrendAnalysis();
}

async function fetchNews(topic){
  if(isLoading) return;

  isLoading = true;

  const loading = document.createElement("div");
  loading.className = "loading";
  loading.textContent = "Loading more stories...";
  newsFeed.appendChild(loading);

  const finalTopic =
    topic ||
    searchBox.value.trim() ||
    category.value ||
    topicPool[topicIndex % topicPool.length];

  topicIndex++;

  try{
    const response = await fetch(`/api/news?q=${encodeURIComponent(finalTopic)}`);
    const data = await response.json();

    loading.remove();

    if(!data.results){
      isLoading = false;
      return;
    }

    const fresh = [];

    data.results.forEach(item=>{
      const title = (item.title || "").trim();
      const cleanTitle = title.toLowerCase();

      if(title && !seenTitles.has(cleanTitle)){
        seenTitles.add(cleanTitle);

        fresh.push({
          title,
          description: item.description || item.content || item.summary || "",
          section: detectSection(title),
          source: item.source_id || "NewsData",
          link: item.link || "#",
          image: item.image_url || ""
        });
      }
    });

    allNews = allNews.concat(fresh);
    renderPage();

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

  leadLeft.innerHTML = "";
  leadMain.innerHTML = "";
  leadRight.innerHTML = "";
  newsFeed.innerHTML = `<div class="loading">Loading live news...</div>`;
  mostReadList.innerHTML = `<li>Loading...</li>`;

  await fetchNews(searchBox.value.trim() || category.value);
}

window.addEventListener("scroll", ()=>{
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 700;

  if(nearBottom){
    const nextTopic = topicPool[topicIndex % topicPool.length];
    fetchNews(nextTopic);
  }
});

searchBtn.addEventListener("click", searchNews);

searchBox.addEventListener("keydown", e=>{
  if(e.key === "Enter") searchNews();
});

document.querySelectorAll(".topicBtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    searchBox.value = btn.dataset.topic;
    searchNews();
  });
});

searchNews();
