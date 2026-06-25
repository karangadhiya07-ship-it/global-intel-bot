const API_ENDPOINT = "/.netlify/functions/news";

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
let marketIndex = 0;

const MAX_HOME_ARTICLES = 30;

const fallbackImages = [
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200",
  "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200",
  "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200"
];

const FALLBACK_ARTICLES = [
  ["White House Faces New Economic Pressure", "US policymakers continue discussions around inflation, jobs, interest rates and economic growth.", "U.S."],
  ["Nvidia And Microsoft Lead AI Market Expansion", "Artificial intelligence investments continue driving major technology companies higher.", "Technology"],
  ["Bitcoin Traders Watch Key Resistance Levels", "Crypto investors remain focused on market liquidity and institutional demand.", "Crypto"],
  ["US Stock Market Opens Higher", "Investors react to economic data and corporate earnings across Wall Street.", "Business"],
  ["Congress Faces New Debate Over Spending And Taxes", "Lawmakers focus on taxes, budgets, jobs and national priorities.", "Politics"],
  ["Weather Systems Bring Travel Concerns Across The United States", "Changing weather patterns could affect travel and energy demand.", "Weather"],
  ["Apple Investors Watch New Product Strategy", "Wall Street continues to monitor Apple as investors look for growth in services and AI.", "Technology"],
  ["Federal Reserve Signals Remain In Focus", "Markets are watching inflation data, employment numbers and interest rate expectations.", "Business"],
  ["US Politics Enters A Critical Week", "Washington remains focused on policy, elections and economic priorities.", "Politics"],
  ["AI Companies Race To Build Next Generation Tools", "Technology firms are investing heavily in artificial intelligence infrastructure.", "Technology"],
  ["Bitcoin Market Volatility Continues", "Crypto traders remain alert as digital assets move with global risk sentiment.", "Crypto"],
  ["Wall Street Watches Big Tech Earnings", "Investors are focused on Microsoft, Nvidia, Apple, Amazon and Meta results.", "Business"],
  ["White House Announces New Policy Priorities", "The administration is expected to focus on economic growth, jobs and national security.", "U.S."],
  ["Global Markets Track US Economic Signals", "World markets are responding to American inflation, rate and corporate data.", "World"],
  ["Microsoft Expands AI Infrastructure", "Cloud and artificial intelligence spending remain key growth areas for the company.", "Technology"],
  ["Tesla Shares Move As EV Competition Grows", "Investors are watching electric vehicle demand and pricing pressure.", "Business"],
  ["Meta Pushes Forward With AI And Advertising", "Meta continues to invest in AI tools while expanding its advertising business.", "Technology"],
  ["Amazon Focuses On Cloud And Retail Growth", "Amazon investors are tracking AWS performance and consumer demand.", "Business"],
  ["Google Parent Alphabet Watches AI Search Shift", "Alphabet remains focused on search, cloud and AI competition.", "Technology"],
  ["Gold Prices Hold Firm As Investors Watch Rates", "Precious metals remain in focus as traders monitor inflation and central bank policy.", "Markets"],
  ["Silver Market Tracks Industrial Demand", "Silver prices are influenced by industrial use, dollar movement and investor demand.", "Markets"],
  ["US Economy Shows Mixed Signals", "New data points to strength in some sectors while households continue to watch prices.", "Business"],
  ["Technology Stocks Continue To Drive Market Momentum", "Large-cap technology names remain central to market performance.", "Technology"],
  ["Crypto Investors Watch Regulation News", "Digital asset markets remain focused on policy, adoption and institutional flows.", "Crypto"],
  ["Congressional Leaders Debate Budget Priorities", "Lawmakers face pressure over spending, taxation and economic policy.", "Politics"],
  ["Weather Risks Affect Travel And Energy Markets", "Storm systems and temperature changes may influence transportation and demand.", "Weather",
  ],
  ["US Markets Prepare For Another Active Session", "Traders are watching earnings, Treasury yields and global headlines.", "Markets"],
  ["AI Chip Demand Keeps Nvidia In Focus", "Nvidia remains a key company for investors tracking artificial intelligence growth.", "Technology"],
  ["Bitcoin And Gold Draw Investor Attention", "Alternative assets are being watched as investors evaluate risk and inflation.", "Markets"],
  ["Washington And Wall Street Watch Inflation Data", "Policy and market decisions remain tied to the latest inflation indicators.", "U.S."]
].map((a, i) => ({
  title: a[0],
  description: a[1],
  section: a[2],
  source: "Global Intel Times",
  image: fallbackImages[i % fallbackImages.length],
  publishedAt: new Date().toISOString(),
  link: "#"
}));

const blockedKeywords = [
  "prediction", "betting", "odds", "casino", "promo code", "coupon",
  "gaming controller", "easysmx", "sponsored", "affiliate", "deal",
  "buy now", "tips and bets", "celebrity gossip", "movie star"
];

const marketItems = [
  { symbol: "AAPL", change: "+1.24%", trend: "up" },
  { symbol: "MSFT", change: "+0.82%", trend: "up" },
  { symbol: "NVDA", change: "+2.31%", trend: "up" },
  { symbol: "AMZN", change: "-0.44%", trend: "down" },
  { symbol: "META", change: "+1.09%", trend: "up" },
  { symbol: "GOOGL", change: "+0.55%", trend: "up" },
  { symbol: "TSLA", change: "-1.76%", trend: "down" },
  { symbol: "BTC", change: "+2.14%", trend: "up" },
  { symbol: "GOLD", change: "+0.41%", trend: "up" },
  { symbol: "SILVER", change: "-0.22%", trend: "down" }
];

if (todayDate) {
  todayDate.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function cleanText(text = "") {
  return String(text || "This story is developing and more updates may follow soon.")
    .replace(/<[^>]*>/g, "")
    .replace(/\[\.\.\.\]/g, "")
    .replace(/The post .* appeared first on .*?\./gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(text, limit = 170) {
  const t = cleanText(text);
  return t.length > limit ? t.slice(0, limit) + "..." : t;
}

function detectSection(title) {
  const t = String(title || "").toLowerCase();

  if (t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")) return "Crypto";
  if (t.includes("gold") || t.includes("silver")) return "Markets";
  if (t.includes("stock") || t.includes("market") || t.includes("economy") || t.includes("fed") || t.includes("nasdaq") || t.includes("inflation")) return "Business";
  if (t.includes("ai") || t.includes("openai") || t.includes("technology") || t.includes("nvidia") || t.includes("microsoft") || t.includes("apple")) return "Technology";
  if (t.includes("weather") || t.includes("storm") || t.includes("rain")) return "Weather";
  if (t.includes("trump") || t.includes("biden") || t.includes("election") || t.includes("white house") || t.includes("congress")) return "Politics";
  if (t.includes("new york") || t.includes("nyc") || t.includes("u.s.") || t.includes("us ")) return "U.S.";

  return "News";
}

function isBadArticle(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  return blockedKeywords.some(word => text.includes(word));
}

function getValidImage(item) {
  const img = item.image || "";

  if (
    img.startsWith("http") &&
    !img.toLowerCase().includes("logo") &&
    !img.toLowerCase().includes("placeholder") &&
    !img.toLowerCase().includes("default") &&
    !img.toLowerCase().includes("benzinga")
  ) {
    return img;
  }

  return "";
}

function articleUrl(id) {
  return `./article.html?id=${id}`;
}

function trackArticleClick(title) {
  const clicks = JSON.parse(localStorage.getItem("articleClicks") || "{}");
  clicks[title] = (clicks[title] || 0) + 1;
  localStorage.setItem("articleClicks", JSON.stringify(clicks));
}

function createArticleCard(item) {
  const id = allNews.indexOf(item);
  const img = getValidImage(item);
  const safeTitle = item.title.replace(/'/g, "");

  return `
    <article class="news-card clickable-card ${!img ? "no-image-card" : ""}">
      <a href="${articleUrl(id)}" onclick="trackArticleClick('${safeTitle}')">
        ${img ? `<img loading="lazy" decoding="async" src="${img}" onerror="this.remove()" alt="${item.title}">` : ""}
        <span class="section-label">${item.section || "NEWS"}</span>
        <h2>${item.title}</h2>
        <p>${shortText(item.description || "", 185)}</p>
        <small>Source: ${item.source || "Global Intel Times"}</small>
        <div class="read-more-btn">Read Full Story →</div>
      </a>
    </article>
  `;
}

function renderLeads() {
  if (leadMain) leadMain.innerHTML = allNews[0] ? createArticleCard(allNews[0]) : "";
  if (leadLeft) leadLeft.innerHTML = allNews[1] ? createArticleCard(allNews[1]) : "";
  if (leadRight) leadRight.innerHTML = allNews[2] ? createArticleCard(allNews[2]) : "";
}

function renderBelowNews() {
  if (!newsFeed) return;

  newsFeed.innerHTML = allNews
    .slice(3, MAX_HOME_ARTICLES)
    .map(createArticleCard)
    .join("");

  localStorage.setItem("articles", JSON.stringify(allNews));
}

function updateTicker() {
  if (!breakingTicker) return;

  breakingTicker.textContent = allNews.length
    ? "LIVE • " + allNews.slice(0, 3).map(x => x.title).join(" • ")
    : "LIVE • Loading latest updates...";
}

function updateMostRead() {
  if (!mostReadList) return;

  mostReadList.innerHTML = allNews
    .slice(0, 8)
    .map((item, i) => `<li><a href="${articleUrl(i)}">${item.title}</a></li>`)
    .join("");
}

function updateTrendAnalysis() {
  const box = document.getElementById("trendAnalysis");
  if (!box) return;

  const counts = {
    Crypto: allNews.filter(x => x.section === "Crypto").length,
    Technology: allNews.filter(x => x.section === "Technology").length,
    Business: allNews.filter(x => x.section === "Business").length,
    Markets: allNews.filter(x => x.section === "Markets").length,
    Weather: allNews.filter(x => x.section === "Weather").length,
    Politics: allNews.filter(x => x.section === "Politics").length,
    News: allNews.filter(x => x.section === "News").length
  };

  const topCategory = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  const score = Math.min(
    100,
    counts.Crypto * 10 +
    counts.Technology * 10 +
    counts.Business * 9 +
    counts.Markets * 8 +
    counts.Politics * 8 +
    counts.Weather * 6 +
    allNews.length * 2
  );

  box.innerHTML = `
    <p><b>Trending Score:</b> ${score}/100</p>
    <p><b>Top Category:</b> ${topCategory}</p>
    <p><b>Total Headlines:</b> ${allNews.length}</p>
    <p><b>AI Mentions:</b> ${counts.Technology}</p>
    <p><b>Finance Mentions:</b> ${counts.Business + counts.Markets}</p>
    <p><b>Crypto Mentions:</b> ${counts.Crypto}</p>
    <p><b>Weather Mentions:</b> ${counts.Weather}</p>
  `;
}

function latestUpdatesWidget() {
  const box = document.getElementById("latestUpdatesBox");
  if (!box) return;

  box.innerHTML = allNews
    .slice(0, 5)
    .map((item, i) => `<a class="latest-update-link" href="${articleUrl(i)}">${item.title}</a>`)
    .join("");
}

function updateTopMarket() {
  const box = document.getElementById("topTrendBox");
  if (!box) return;

  const item = marketItems[marketIndex % marketItems.length];

  box.className = "top-trend-box " + item.trend;
  box.innerHTML = `${item.symbol} ${item.change} ${item.trend === "up" ? "↑" : "↓"}`;
  box.style.cursor = "pointer";

  box.onclick = function () {
    window.location.href = `./market.html?symbol=${item.symbol}`;
  };

  marketIndex++;
}

function updateHomeSchema() {
  const oldSchema = document.getElementById("homeItemListSchema");
  if (oldSchema) oldSchema.remove();

  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.id = "homeItemListSchema";

  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest News on Global Intel Times",
    numberOfItems: allNews.length,
    itemListElement: allNews.slice(0, 30).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${window.location.origin}/article.html?id=${index}`,
      name: item.title
    }))
  });

  document.head.appendChild(schema);
}

function fillToThirty() {
  const unique = [];
  const titles = new Set();

  [...allNews, ...FALLBACK_ARTICLES].forEach(item => {
    const key = item.title.toLowerCase().trim();

    if (!titles.has(key)) {
      titles.add(key);
      unique.push(item);
    }
  });

  allNews = unique.slice(0, MAX_HOME_ARTICLES);
}

function renderPage() {
  fillToThirty();

  allNews = allNews.slice(0, MAX_HOME_ARTICLES);
  localStorage.setItem("articles", JSON.stringify(allNews));

  renderLeads();
  renderBelowNews();
  updateTicker();
  updateMostRead();
  updateTrendAnalysis();
  latestUpdatesWidget();
  updateTopMarket();
  updateHomeSchema();
}

function useFallbackNews() {
  allNews = FALLBACK_ARTICLES.slice(0, MAX_HOME_ARTICLES);
  localStorage.setItem("articles", JSON.stringify(allNews));
  localStorage.setItem("cachedNews", JSON.stringify(allNews));
  renderPage();
}

async function fetchNews(topic) {
  if (isLoading || !newsFeed) return;

  isLoading = true;

  const cached = localStorage.getItem("cachedNews");

  if (cached) {
    try {
      allNews = JSON.parse(cached);
      if (allNews.length) renderPage();
    } catch (e) {}
  } else {
    newsFeed.innerHTML = `<div class="loading">Loading live news...</div>`;
  }

  try {
    const controller = new AbortController();

    setTimeout(() => {
      controller.abort();
    }, 3000);

    const response = await fetch(`${API_ENDPOINT}?q=${encodeURIComponent(topic)}`, {
      signal: controller.signal
    });

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    const fresh = [];

    results.forEach(item => {
      const title = cleanText(item.title || "");
      const description = cleanText(item.description || item.content || item.summary || "");
      const key = title.toLowerCase();

      if (!title) return;
      if (seenTitles.has(key)) return;
      if (isBadArticle(title, description)) return;

      seenTitles.add(key);

      fresh.push({
        title,
        description,
        section: detectSection(title),
        source: item.source_id || item.source || "News",
        link: item.link || item.url || "#",
        image: item.image_url || item.image || "",
        publishedAt: item.pubDate || item.publishedAt || item.published_at || new Date().toISOString()
      });
    });

    allNews = fresh.slice(0, MAX_HOME_ARTICLES);

    if (allNews.length) {
      fillToThirty();
      localStorage.setItem("cachedNews", JSON.stringify(allNews));
      renderPage();
    } else {
      useFallbackNews();
    }

  } catch (error) {
    console.warn("Live news failed. Showing fallback news.", error);

    if (!allNews.length) {
      useFallbackNews();
    } else {
      renderPage();
    }
  }

  isLoading = false;
}

async function searchNews(topic = "usa breaking news") {
  allNews = [];
  seenTitles = new Set();

  if (leadLeft) leadLeft.innerHTML = "";
  if (leadMain) leadMain.innerHTML = "";
  if (leadRight) leadRight.innerHTML = "";
  if (mostReadList) mostReadList.innerHTML = `<li>Loading...</li>`;

  await fetchNews(topic);
}

function setupCategoryButtons() {
  document.querySelectorAll(".topicBtn").forEach(btn => {
    btn.onclick = function () {
      searchNews(btn.dataset.topic || "usa breaking news");
    };
  });
}

function setupCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;

  banner.style.display = localStorage.getItem("cookiesAccepted") === "yes" ? "none" : "flex";
}

function acceptCookies() {
  localStorage.setItem("cookiesAccepted", "yes");

  const banner = document.getElementById("cookieBanner");
  if (banner) banner.style.display = "none";
}

window.acceptCookies = acceptCookies;
window.trackArticleClick = trackArticleClick;

function setupNewsletter() {
  const input = document.querySelector(".newsletter-input");
  const btn = document.querySelector(".newsletter-btn");
  if (!input || !btn) return;

  btn.onclick = function () {
    const email = input.value.trim();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("newsletterEmails") || "[]");

    if (!saved.includes(email)) {
      saved.push(email);
      localStorage.setItem("newsletterEmails", JSON.stringify(saved));
    }

    input.value = "";
    alert("Thanks for subscribing!");
  };
}

function updateVisitorCount() {
  const today = new Date().toDateString();
  const key = "visitorCount_" + today;

  const count = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, count);

  const box = document.getElementById("visitorCounter");
  if (box) box.textContent = count + " visits today";
}

function updateArticleSEO(article) {
  document.title = `${article.title} | Global Intel Times`;
}

function readingTime(text) {
  return `${Math.max(1, Math.ceil(cleanText(text).split(" ").length / 220))} min read`;
}

function renderArticlePage() {
  const articleBox = document.getElementById("articleView");
  if (!articleBox) return;

  let articles = JSON.parse(localStorage.getItem("articles") || "[]");

  if (!articles.length) {
    articles = FALLBACK_ARTICLES;
    localStorage.setItem("articles", JSON.stringify(articles));
  }

  const id = Number(new URLSearchParams(window.location.search).get("id") || 0);
  const article = articles[id];

  if (!article) {
    articleBox.innerHTML = `<h1>Article not found</h1><p>Please go back to homepage.</p>`;
    return;
  }

  updateArticleSEO(article);
  const img = getValidImage(article);

  articleBox.innerHTML = `
    <div class="breadcrumb"><a href="./index.html">Home</a> › ${article.section}</div>
    <span class="section-label">${article.section}</span>
    <h1>${article.title}</h1>
    <p class="article-meta">${article.source || "Global Intel Times"} • ${readingTime(article.description)}</p>
    ${img ? `<img class="article-main-img" src="${img}" alt="${article.title}" onerror="this.remove()">` : ""}
    <p class="article-intro">${article.description}</p>
    <p>Global Intel Times is tracking this developing story as part of our USA-focused news coverage.</p>
    ${article.link && article.link !== "#" ? `<a href="${article.link}" target="_blank" rel="noopener nofollow" class="source-link">Original Source</a>` : ""}
  `;
}

setupCookieBanner();
setupNewsletter();
updateVisitorCount();
setupCategoryButtons();

setInterval(updateTopMarket, 5000);
updateTopMarket();

if (document.getElementById("articleView")) {
  renderArticlePage();
} else {
  searchNews("usa breaking news");

  setInterval(() => {
    searchNews("usa breaking news");
  }, 300000);
}
