const newsFeed = document.getElementById("newsFeed");
const headlineCount = document.getElementById("headlineCount");
const financeRisk = document.getElementById("financeRisk");
const cryptoAlert = document.getElementById("cryptoAlert");
const aiWatch = document.getElementById("aiWatch");
const riskPanel = document.getElementById("riskPanel");

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const category = document.getElementById("category");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let allNews = [];
let visibleCount = 10;

function detectCategory(title){
  const t = title.toLowerCase();

  if(t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")) return "Crypto";
  if(t.includes("market") || t.includes("stock") || t.includes("economy")) return "Finance";
  if(t.includes("ai") || t.includes("openai") || t.includes("technology")) return "AI News";
  if(t.includes("weather") || t.includes("storm")) return "Weather";

  return "Global News";
}

function detectRisk(title){
  const t = title.toLowerCase();

  if(
    t.includes("war") ||
    t.includes("attack") ||
    t.includes("crash") ||
    t.includes("plunge")
  ){
    return "High";
  }

  if(
    t.includes("bitcoin") ||
    t.includes("market") ||
    t.includes("inflation") ||
    t.includes("ai")
  ){
    return "Medium";
  }

  return "Low";
}

function updateTicker(items){
  const ticker = document.getElementById("breakingTicker");

  if(!ticker) return;

  ticker.innerHTML =
    "🔥 BREAKING: " +
    items
      .slice(0,8)
      .map(x => x.title)
      .join(" • ");
}

function renderRiskPanel(items){

  riskPanel.innerHTML = "";

  items.slice(0,6).forEach(item => {

    const div = document.createElement("div");

    if(item.risk === "High"){
      div.className = "risk-box red";
    }else if(item.risk === "Medium"){
      div.className = "risk-box yellow";
    }else{
      div.className = "risk-box green";
    }

    div.textContent =
      `${item.category}: ${item.risk}`;

    riskPanel.appendChild(div);

  });

}

function renderNews(){

  newsFeed.innerHTML = "";

  const items =
    allNews.slice(0, visibleCount);

  items.forEach(item => {

    const div =
      document.createElement("div");

    div.className = "news-item";

    div.innerHTML = `

    ${item.image ? `
    <img
    src="${item.image}"
    onerror="this.style.display='none'"
    style="
    width:100%;
    max-height:350px;
    object-fit:cover;
    border-radius:12px;
    margin-bottom:12px;
    ">
    ` : ""}

    <h3>${item.title}</h3>

    <p><b>Category:</b> ${item.category}</p>
    <p><b>Risk:</b> ${item.risk}</p>
    <p><b>Source:</b> ${item.source}</p>

    <a href="${item.link}"
    target="_blank">
    Read Full Story →
    </a>

    `;

    newsFeed.appendChild(div);

  });

  headlineCount.textContent =
    allNews.length;

  financeRisk.textContent =
    allNews.some(x=>x.risk==="High")
    ? "High"
    : "Low";

  cryptoAlert.textContent =
    allNews.some(x=>x.category==="Crypto")
    ? "High Alert"
    : "Normal";

  aiWatch.textContent =
    allNews.some(x=>x.category==="AI News")
    ? "Active"
    : "Monitoring";

  renderRiskPanel(allNews);

  updateTicker(allNews);

}

async function searchNews(){

  const query =
    searchBox.value.trim()
    || category.value
    || "world";

  newsFeed.innerHTML =
    `<div class="news-item">
      Loading live news...
    </div>`;

  try{

    const response =
      await fetch(
        `/api/news?q=${encodeURIComponent(query)}`
      );

    const data =
      await response.json();

    if(!data.results){
      return;
    }

    const uniqueResults = [];
    const seenTitles = new Set();

    data.results.forEach(item=>{

      const title =
        (item.title || "")
        .toLowerCase()
        .trim();

      if(
        title &&
        !seenTitles.has(title)
      ){
        seenTitles.add(title);
        uniqueResults.push(item);
      }

    });

    allNews =
      uniqueResults
      .slice(0,30)
      .map(item=>{

        const title =
          item.title || "Untitled";

        return {

          title,

          category:
            detectCategory(title),

          risk:
            detectRisk(title),

          source:
            item.source_id ||
            "NewsData",

          link:
            item.link || "#",

          image:
            item.image_url || ""

        };

      });

    visibleCount = 10;

    renderNews();

  }
  catch(err){

    console.error(err);

    newsFeed.innerHTML =
      `<div class="news-item">
      Failed to load live news.
      </div>`;

  }

}

searchBtn.addEventListener(
  "click",
  searchNews
);

searchBox.addEventListener(
  "keydown",
  function(e){
    if(e.key==="Enter"){
      searchNews();
    }
  }
);

loadMoreBtn.addEventListener(
  "click",
  function(){

    visibleCount += 10;

    renderNews();

  }
);

document
.querySelectorAll(".topicBtn")
.forEach(btn => {

  btn.addEventListener(
    "click",
    function(){

      searchBox.value =
        this.dataset.topic;

      searchNews();

    }
  );

});

searchNews();

setInterval(
  searchNews,
  300000
);
