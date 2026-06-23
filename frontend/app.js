const newsFeed = document.getElementById("newsFeed");
const headlineCount = document.getElementById("headlineCount");
const financeRisk = document.getElementById("financeRisk");
const cryptoAlert = document.getElementById("cryptoAlert");
const aiWatch = document.getElementById("aiWatch");
const riskPanel = document.getElementById("riskPanel");

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const category = document.getElementById("category");

function detectCategory(title){
  const t = title.toLowerCase();

  if(t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")){
    return "Crypto";
  }

  if(t.includes("stock") || t.includes("market") || t.includes("fed") || t.includes("inflation") || t.includes("economy")){
    return "Finance";
  }

  if(t.includes("ai") || t.includes("technology") || t.includes("openai")){
    return "AI News";
  }

  if(t.includes("weather") || t.includes("storm") || t.includes("rain")){
    return "Weather";
  }

  return "Global News";
}

function detectRisk(title){
  const t = title.toLowerCase();

  if(
    t.includes("war") ||
    t.includes("crash") ||
    t.includes("plunge") ||
    t.includes("attack") ||
    t.includes("warning") ||
    t.includes("emergency")
  ){
    return "High";
  }

  if(
    t.includes("market") ||
    t.includes("fed") ||
    t.includes("bitcoin") ||
    t.includes("inflation") ||
    t.includes("ai")
  ){
    return "Medium";
  }

  return "Low";
}

function calculateRisk(items){
  let score = 0;

  items.forEach(item=>{
    if(item.risk === "High") score += 3;
    if(item.risk === "Medium") score += 2;
    if(item.risk === "Low") score += 1;
  });

  if(score >= 8) return "High";
  if(score >= 5) return "Medium";
  return "Low";
}

function renderNews(items){
  newsFeed.innerHTML = "";

  if(items.length === 0){
    newsFeed.innerHTML = `<div class="news-item">No live news found.</div>`;
    headlineCount.textContent = "0";
    return;
  }

  items.forEach(item=>{
    const div = document.createElement("div");
    div.className = "news-item";

    div.innerHTML = `
      <strong>${item.title}</strong><br>
      Category: ${item.category}<br>
      Risk Level: ${item.risk}<br>
      Source: ${item.source}<br>
      ${item.link ? `<a href="${item.link}" target="_blank">Open Source</a>` : ""}
    `;

    newsFeed.appendChild(div);
  });

  headlineCount.textContent = items.length;

  const risk = calculateRisk(items);
  financeRisk.textContent = risk;

  cryptoAlert.textContent =
    items.some(i=>i.category === "Crypto" && i.risk === "High")
    ? "High Alert"
    : "Normal";

  aiWatch.textContent =
    items.some(i=>i.category === "AI News")
    ? "Active"
    : "Monitoring";

  renderRiskPanel(items);
}

function renderRiskPanel(items){
  riskPanel.innerHTML = "";

  items.forEach(item=>{
    const div = document.createElement("div");

    if(item.risk === "High") div.className = "risk-box red";
    else if(item.risk === "Medium") div.className = "risk-box yellow";
    else div.className = "risk-box green";

    div.textContent = `${item.category}: ${item.risk}`;
    riskPanel.appendChild(div);
  });
}

async function searchNews(){
  const query = searchBox.value.trim() || category.value || "world";

  newsFeed.innerHTML = `<div class="news-item">Loading live news...</div>`;

  try{
    const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if(!data.results || data.results.length === 0){
      renderNews([]);
      return;
    }

    const items = data.results.slice(0, 10).map(item=>{
      const title = item.title || "Untitled news";

      return {
        title,
        category: detectCategory(title),
        risk: detectRisk(title),
        source: item.source_id || item.source_name || "NewsData",
        link: item.link || "#"
      };
    });

    renderNews(items);

  }catch(error){
    newsFeed.innerHTML = `<div class="news-item">Failed to load live news.</div>`;
  }
}

searchBtn.addEventListener("click", searchNews);

searchBox.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    searchNews();
  }
});

searchNews();
