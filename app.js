const newsFeed = document.getElementById("newsFeed");
const headlineCount = document.getElementById("headlineCount");
const financeRisk = document.getElementById("financeRisk");
const cryptoAlert = document.getElementById("cryptoAlert");
const aiWatch = document.getElementById("aiWatch");
const riskPanel = document.getElementById("riskPanel");

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const category = document.getElementById("category");

let allNews = [];
let seenTitles = new Set();
let isLoading = false;
let topicIndex = 0;

const topicPool = [
  "usa breaking news",
  "world breaking news",
  "bitcoin crypto news",
  "stock market finance news",
  "artificial intelligence news",
  "new york news",
  "weather alert news",
  "sports news usa",
  "business news usa",
  "technology news usa"
];

function getSourceLogo(source) {
  const s = source.toLowerCase();

  if (s.includes("cnn")) return "🟥 CNN";
  if (s.includes("bbc")) return "🔵 BBC";
  if (s.includes("fox")) return "🦊 FOX";
  if (s.includes("reuters")) return "⚫ Reuters";
  if (s.includes("bloomberg")) return "🟠 Bloomberg";
  if (s.includes("cnbc")) return "📈 CNBC";
  if (s.includes("yahoo")) return "🟣 Yahoo";
  if (s.includes("ap")) return "📰 AP";

  return "📰 " + source;
}

function detectCategory(title) {
  const t = title.toLowerCase();

  if (t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")) return "Crypto";
  if (t.includes("market") || t.includes("stock") || t.includes("economy") || t.includes("fed")) return "Finance";
  if (t.includes("ai") || t.includes("openai") || t.includes("technology")) return "AI News";
  if (t.includes("weather") || t.includes("storm") || t.includes("heatwave")) return "Weather";
  if (t.includes("sport") || t.includes("nba") || t.includes("nfl")) return "Sports";
  if (t.includes("new york") || t.includes("nyc")) return "NYC News";

  return "Global News";
}

function detectRisk(title) {
  const t = title.toLowerCase();

  if (
    t.includes("war") ||
    t.includes("attack") ||
    t.includes("crash") ||
    t.includes("plunge") ||
    t.includes("emergency") ||
    t.includes("warning")
  ) return "High";

  if (
    t.includes("bitcoin") ||
    t.includes("market") ||
    t.includes("inflation") ||
    t.includes("ai") ||
    t.includes("fed")
  ) return "Medium";

  return "Low";
}

function updateTicker() {
  const ticker = document.getElementById("breakingTicker");
  if (!ticker || !allNews.length) return;

  ticker.innerHTML =
    "🔥 BREAKING: " +
    allNews.slice(0, 8).map(item => item.title).join(" • ");
}

function updateStats() {
  headlineCount.textContent = allNews.length;

  financeRisk.textContent =
    allNews.some(x => x.category === "Finance" && x.risk !== "Low")
      ? "High"
      : "Low";

  cryptoAlert.textContent =
    allNews.some(x => x.category === "Crypto")
      ? "High Alert"
      : "Normal";

  aiWatch.textContent =
    allNews.some(x => x.category === "AI News")
      ? "Active"
      : "Monitoring";

  renderRiskPanel();
  updateTicker();
}

function renderRiskPanel() {
  riskPanel.innerHTML = "";

  allNews.slice(0, 8).forEach(item => {
    const div = document.createElement("div");

    if (item.risk === "High") div.className = "risk-box red";
    else if (item.risk === "Medium") div.className = "risk-box yellow";
    else div.className = "risk-box green";

    div.textContent = `${item.category}: ${item.risk}`;
    riskPanel.appendChild(div);
  });
}

function createAdBox(index) {
  if (index > 0 && index % 4 === 0) {
    const ad = document.createElement("div");
    ad.className = "ad-box in-feed-ad";
    ad.textContent = "In-Feed Ad Space 336x280";
    newsFeed.appendChild(ad);
  }
}

function addNewsToPage(items) {
  items.forEach((item, index) => {
    createAdBox(allNews.length + index);

    const div = document.createElement("div");
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

      <div class="source-logo">${getSourceLogo(item.source)}</div>

      <h3>${item.title}</h3>

      <p><b>Category:</b> ${item.category}</p>
      <p><b>Risk:</b> ${item.risk}</p>
      <p><b>Source:</b> ${item.source}</p>

      <a href="${item.link}" target="_blank">Read Full Story →</a>
    `;

    newsFeed.appendChild(div);
  });
}

async function fetchMoreNews(customTopic) {
  if (isLoading) return;
  isLoading = true;

  const loadingBox = document.createElement("div");
  loadingBox.className = "news-item";
  loadingBox.textContent = "Loading more live news...";
  newsFeed.appendChild(loadingBox);

  const baseTopic =
    customTopic ||
    searchBox.value.trim() ||
    category.value ||
    topicPool[topicIndex % topicPool.length];

  const finalTopic =
    baseTopic + " " + topicPool[topicIndex % topicPool.length];

  topicIndex++;

  try {
    const response = await fetch(`/api/news?q=${encodeURIComponent(finalTopic)}`);
    const data = await response.json();

    loadingBox.remove();

    if (!data.results || !data.results.length) {
      isLoading = false;
      return;
    }

    const freshItems = [];

    data.results.forEach(item => {
      const cleanTitle = (item.title || "").toLowerCase().trim();

      if (cleanTitle && !seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);

        const title = item.title || "Untitled";

        freshItems.push({
          title,
          category: detectCategory(title),
          risk: detectRisk(title),
          source: item.source_id || "NewsData",
          link: item.link || "#",
          image: item.image_url || ""
        });
      }
    });

    allNews = allNews.concat(freshItems);

    addNewsToPage(freshItems);
    updateStats();

  } catch (error) {
    console.error(error);
    loadingBox.textContent = "Failed to load live news.";
  }

  isLoading = false;
}

async function searchNews() {
  newsFeed.innerHTML = "";
  allNews = [];
  seenTitles = new Set();
  topicIndex = 0;

  await fetchMoreNews(searchBox.value.trim() || category.value || "usa breaking news");
}

window.addEventListener("scroll", () => {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 700;

  if (nearBottom) {
    fetchMoreNews();
  }
});

searchBtn.addEventListener("click", searchNews);

searchBox.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    searchNews();
  }
});

document.querySelectorAll(".topicBtn").forEach(btn => {
  btn.addEventListener("click", function() {
    searchBox.value = this.dataset.topic;
    searchNews();
  });
});

searchNews();

setInterval(() => {
  fetchMoreNews();
}, 300000);
