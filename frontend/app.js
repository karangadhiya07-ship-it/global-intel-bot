const newsFeed = document.getElementById("newsFeed");
const headlineCount = document.getElementById("headlineCount");
const financeRisk = document.getElementById("financeRisk");
const cryptoAlert = document.getElementById("cryptoAlert");
const aiWatch = document.getElementById("aiWatch");
const riskPanel = document.getElementById("riskPanel");

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const category = document.getElementById("category");

const demoNews = [
  {
    title: "Global markets watch Federal Reserve signals",
    category: "Finance",
    risk: "Medium",
    source: "Demo Source"
  },
  {
    title: "Bitcoin traders react to fresh market volatility",
    category: "Crypto",
    risk: "High",
    source: "Demo Source"
  },
  {
    title: "AI companies expand tools for news and research",
    category: "AI News",
    risk: "Medium",
    source: "Demo Source"
  },
  {
    title: "Weather alerts monitored across major U.S. cities",
    category: "Weather",
    risk: "Low",
    source: "Demo Source"
  }
];

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

  items.forEach(item=>{
    const div = document.createElement("div");
    div.className = "news-item";

    div.innerHTML = `
      <strong>${item.title}</strong><br>
      Category: ${item.category}<br>
      Risk Level: ${item.risk}<br>
      Source: ${item.source}
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

function searchNews(){
  const query = searchBox.value.toLowerCase();
  const selectedCategory = category.value;

  let filtered = demoNews.filter(item=>{
    const matchText =
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchCategory =
      selectedCategory === "Global News" ||
      item.category === selectedCategory;

    return matchText && matchCategory;
  });

  if(query === ""){
    filtered = demoNews.filter(item=>{
      return selectedCategory === "Global News" ||
      item.category === selectedCategory;
    });
  }

  renderNews(filtered);
}

searchBtn.addEventListener("click", searchNews);

searchBox.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    searchNews();
  }
});

renderNews(demoNews);
