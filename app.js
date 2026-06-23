const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const category = document.getElementById("category");

const breakingTicker = document.getElementById("breakingTicker");
const newsFeed = document.getElementById("newsFeed");
const leadLeft = document.getElementById("leadLeft");
const leadMain = document.getElementById("leadMain");
const leadRight = document.getElementById("leadRight");
const todayDate = document.getElementById("todayDate");

let allNews = [];
let seenTitles = new Set();
let isLoading = false;
let pageTopicIndex = 0;

const topicPool = [
  "usa breaking news",
  "world breaking news",
  "stock market finance news",
  "artificial intelligence news",
  "bitcoin crypto news",
  "new york news",
  "sports news usa",
  "weather alert news"
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

  return "News";
}

function cleanText(text){
  if(!text) return "";
  return text.length > 160 ? text.slice(0,160) + "..." : text;
}

function createArticleCard(item, big=false){
  return `
    ${item.image ? `
      <img
        src="${item.image}"
        onerror="this.style.display='none'"
        alt="news image"
      >
    ` : ""}

    <span class="section-label">${item.section}</span>

    <h2>${item.title}</h2>

    <p>${cleanText(item.description)}</p>

    <small>Source: ${item.source}</small><br>

    <a href="./article.html?id=${allNews.indexOf(item)}">Read more ›</a>
  `;
}

function renderLeads(){
  const top = allNews.slice(0,3);

  leadLeft.innerHTML =
    top[0] ? createArticleCard(top[0]) : "";

  leadMain.innerHTML =
    top[1] ? createArticleCard(top[1], true) : "";

  leadRight.innerHTML =
    top[2] ? createArticleCard(top[2]) : "";
}

function renderBelowNews(){
  newsFeed.innerHTML = "";

  allNews.slice(3).forEach(item=>{
    const article = document.createElement("article");
    article.className = "news-card";
    article.innerHTML = createArticleCard(item);
    newsFeed.appendChild(article);
  });
}

function updateTicker(){
  if(!allNews.length){
    breakingTicker.textContent = "LIVE • Loading latest updates...";
    return;
  }

  breakingTicker.textContent =
    "LIVE • " +
    allNews
      .slice(0,6)
      .map(item=>item.title)
      .join(" • ");
}

function renderPage(){
  localStorage.setItem("articles", JSON.stringify(allNews));
  renderLeads();
  renderBelowNews();
  updateTicker();
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
    topicPool[pageTopicIndex % topicPool.length];

  pageTopicIndex++;

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
          description: item.description || "",
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
  pageTopicIndex = 0;

  leadLeft.innerHTML = "";
  leadMain.innerHTML = "";
  leadRight.innerHTML = "";
  newsFeed.innerHTML = `<div class="loading">Loading live news...</div>`;

  await fetchNews(searchBox.value.trim() || category.value);
}

window.addEventListener("scroll", ()=>{
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 700;

  if(nearBottom){
    const nextTopic =
      topicPool[pageTopicIndex % topicPool.length];

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
