const DEFAULT_TOPIC = "usa breaking news politics economy ai stock market";
const MAX_HOME_ARTICLES = 30;

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

const fallbackImages = [
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200",
  "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200"
];

const FALLBACK_ARTICLES = [
  ["White House Faces New Economic Pressure", "US policymakers continue discussions around inflation, jobs and economic growth.", "U.S.", "us"],
  ["Nvidia And Microsoft Lead AI Market Expansion", "AI investments continue driving major technology companies higher.", "Technology", "ai"],
  ["Bitcoin Traders Watch Key Resistance Levels", "Crypto investors remain focused on liquidity and institutional demand.", "Crypto", "bitcoin"],
  ["US Stock Market Opens Higher", "Investors react to economic data and corporate earnings across Wall Street.", "Business", "stock-market"],
  ["Congress Faces New Debate Over Spending", "Lawmakers focus on taxes, budgets, jobs and national priorities.", "Politics", "politics"],
  ["Weather Systems Bring Travel Concerns", "Changing weather patterns could affect travel and energy demand.", "Weather", "weather"],
  ["Apple Investors Watch New Product Strategy", "Wall Street continues to monitor Apple as investors look for AI growth.", "Technology", "apple"],
  ["Federal Reserve Signals Remain In Focus", "Markets are watching inflation data and interest rate expectations.", "Business", "federal-reserve"],
  ["US Politics Enters A Critical Week", "Washington remains focused on policy, elections and economic priorities.", "Politics", "politics"],
  ["AI Companies Race To Build Next Generation Tools", "Technology firms are investing heavily in AI infrastructure.", "AI", "ai"],
  ["Wall Street Watches Big Tech Earnings", "Investors are focused on Microsoft, Nvidia, Apple, Amazon and Meta results.", "Business", "business"],
  ["Global Markets Track US Economic Signals", "World markets are responding to American inflation and corporate data.", "World", "world"],
  ["Tesla Shares Move As EV Competition Grows", "Investors are watching electric vehicle demand and pricing pressure.", "Business", "tesla"],
  ["Meta Pushes Forward With AI And Advertising", "Meta continues to invest in AI tools while expanding advertising.", "Technology", "meta"],
  ["Amazon Focuses On Cloud And Retail Growth", "Amazon investors are tracking AWS performance and consumer demand.", "Business", "amazon"],
  ["Google Parent Alphabet Watches AI Search Shift", "Alphabet remains focused on search, cloud and AI competition.", "Technology", "google"],
  ["Gold Prices Hold Firm As Investors Watch Rates", "Precious metals remain in focus as traders monitor inflation.", "Markets", "gold"],
  ["Silver Market Tracks Industrial Demand", "Silver prices are influenced by industrial use and investor demand.", "Markets", "silver"],
  ["US Economy Shows Mixed Signals", "New data points to strength in some sectors while households watch prices.", "Business", "economy"],
  ["Crypto Investors Watch Regulation News", "Digital asset markets remain focused on policy and institutional flows.", "Crypto", "crypto"],
  ["Congressional Leaders Debate Budget Priorities", "Lawmakers face pressure over spending, taxation and economic policy.", "Politics", "congress"],
  ["US Markets Prepare For Another Active Session", "Traders are watching earnings, Treasury yields and global headlines.", "Markets", "markets"],
  ["AI Chip Demand Keeps Nvidia In Focus", "Nvidia remains central for investors tracking artificial intelligence growth.", "Technology", "nvidia"],
  ["Bitcoin And Gold Draw Investor Attention", "Alternative assets are watched as investors evaluate risk and inflation.", "Markets", "markets"],
  ["Washington And Wall Street Watch Inflation Data", "Policy and market decisions remain tied to inflation indicators.", "U.S.", "inflation"],
  ["Microsoft Expands AI Infrastructure", "Cloud and AI spending remain key growth areas for the company.", "Technology", "microsoft"],
  ["White House Announces New Policy Priorities", "The administration focuses on economic growth, jobs and national security.", "U.S.", "white-house"],
  ["Technology Stocks Continue To Drive Momentum", "Large-cap technology names remain central to market performance.", "Technology", "technology"],
  ["Weather Risks Affect Travel And Energy Markets", "Storm systems and temperature changes may influence transportation.", "Weather", "weather"],
  ["Business Leaders Watch Consumer Confidence", "Corporate executives monitor spending trends and economic uncertainty.", "Business", "business"]
].map((a, i) => ({
  title: a[0],
  description: a[1],
  section: a[2],
  topic: a[3],
  source: "Global Intel Times",
  image: fallbackImages[i % fallbackImages.length],
  link: "#",
  publishedAt: new Date().toISOString()
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

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\./g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function detectSection(title) {
  const t = String(title || "").toLowerCase();

  if (t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")) return "Crypto";
  if (t.includes("gold") || t.includes("silver")) return "Markets";

  if (
    t.includes("stock") ||
    t.includes("market") ||
    t.includes("economy") ||
    t.includes("fed") ||
    t.includes("nasdaq") ||
    t.includes("inflation") ||
    t.includes("wall street")
  ) {
    return "Business";
  }

  if (
    t.includes("ai") ||
    t.includes("openai") ||
    t.includes("technology") ||
    t.includes("nvidia") ||
    t.includes("microsoft") ||
    t.includes("apple") ||
    t.includes("google") ||
    t.includes("amazon") ||
    t.includes("meta")
  ) {
    return "Technology";
  }

  if (t.includes("weather") || t.includes("storm") || t.includes("rain")) return "Weather";

  if (
    t.includes("trump") ||
    t.includes("biden") ||
    t.includes("election") ||
    t.includes("white house") ||
    t.includes("congress") ||
    t.includes("senate")
  ) {
    return "Politics";
  }

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

function safeForClick(text) {
  return String(text || "")
    .replace(/'/g, "")
    .replace(/"/g, "")
    .replace(/</g, "")
    .replace(/>/g, "");
}

function trackArticleClick(title) {
  const clicks = JSON.parse(localStorage.getItem("articleClicks") || "{}");
  clicks[title] = (clicks[title] || 0) + 1;
  localStorage.setItem("articleClicks", JSON.stringify(clicks));
}

window.trackArticleClick = trackArticleClick;

function readingTime(text) {
  return `${Math.max(1, Math.ceil(cleanText(text).split(" ").length / 220))} min read`;
}
function createArticleCard(item) {
  const id = allNews.indexOf(item);
  const img = getValidImage(item);
  const safeTitle = safeForClick(item.title);

  return `
    <article class="news-card clickable-card ${!img ? "no-image-card" : ""}">
      <a href="${articleUrl(id)}" onclick="trackArticleClick('${safeTitle}')">
        ${
          img
            ? `<img loading="lazy" decoding="async" src="${img}" onerror="this.remove()" alt="${item.title}">`
            : ""
        }
        <span class="section-label">${item.section || "NEWS"}</span>
        <h2>${item.title}</h2>
        <p>${shortText(item.description || "", 185)}</p>
        <small>Source: ${item.source || "Global Intel Times"} • ${readingTime(item.description)}</small>
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
    ? "LIVE • " + allNews.slice(0, 4).map(x => x.title).join(" • ")
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
    AI: allNews.filter(x => x.section === "AI").length,
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
    counts.AI * 10 +
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
    <p><b>AI Mentions:</b> ${counts.Technology + counts.AI}</p>
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

  box.className = "market-mini top-trend-box " + item.trend;
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
    const key = String(item.title || "").toLowerCase().trim();

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
  localStorage.setItem("cachedNews", JSON.stringify(allNews));

  renderLeads();
  renderBelowNews();
  updateTicker();
  updateMostRead();
  updateTrendAnalysis();
  latestUpdatesWidget();
  updateTopMarket();
  updateHomeSchema();

  renderLongHomepageSections();
}

function useFallbackNews() {
  allNews = FALLBACK_ARTICLES.slice(0, MAX_HOME_ARTICLES);
  renderPage();
}

async function fetchNewsFromEndpoint(endpoint, topic, signal) {
  const response = await fetch(`${endpoint}?q=${encodeURIComponent(topic || DEFAULT_TOPIC)}`, {
    signal
  });

  if (!response.ok) {
    throw new Error("News API failed: " + response.status);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("News API did not return JSON");
  }

  return await response.json();
}

async function fetchNews(topic) {
  if (isLoading || !newsFeed) return;

  isLoading = true;

  const cached = localStorage.getItem("cachedNews");

  if (cached) {
    try {
      const cachedNews = JSON.parse(cached);

      if (Array.isArray(cachedNews) && cachedNews.length) {
        allNews = cachedNews;
        renderPage();
      }
    } catch (e) {
      localStorage.removeItem("cachedNews");
    }
  } else {
    newsFeed.innerHTML = `<div class="loading">Loading live news...</div>`;
  }

  try {
    const controller = new AbortController();

    setTimeout(() => {
      controller.abort();
    }, 4000);

    let data;

    try {
      data = await fetchNewsFromEndpoint("/api/news", topic, controller.signal);
    } catch (error) {
      data = await fetchNewsFromEndpoint("/.netlify/functions/news", topic, controller.signal);
    }

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
        topic: slugify(detectSection(title)),
        source: item.source_id || item.source || "News",
        link: item.link || item.url || "#",
        image: item.image_url || item.image || "",
        publishedAt: item.pubDate || item.publishedAt || item.published_at || new Date().toISOString()
      });
    });

    allNews = fresh.slice(0, MAX_HOME_ARTICLES);

    if (allNews.length) {
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

async function searchNews(topic = DEFAULT_TOPIC) {
  allNews = [];
  seenTitles = new Set();

  if (leadLeft) leadLeft.innerHTML = "";
  if (leadMain) leadMain.innerHTML = "";
  if (leadRight) leadRight.innerHTML = "";
  if (mostReadList) mostReadList.innerHTML = `<li>Loading...</li>`;

  await fetchNews(topic);
}
const MORE_NEWS_DATA = [
  ["Supreme Court Ruling Sends New Signals Across Washington", "Politics", "5 min read"],
  ["Markets Watch Fed Officials as Rate Debate Intensifies", "Markets", "4 min read"],
  ["AI Startups Race to Build Tools for the Workplace", "AI", "6 min read"],
  ["New York Transit Leaders Face Pressure Over Delays", "New York", "3 min read"],
  ["Bitcoin Traders Track Liquidity After Volatile Week", "Crypto", "4 min read"],
  ["Climate Risks Put Summer Travel Plans Under Pressure", "Climate", "5 min read"],
  ["Big Tech Earnings Remain Central to Wall Street", "Business", "4 min read"],
  ["White House Weighs New Economic Messaging", "U.S.", "3 min read"],
  ["Energy Markets Move as Weather Demand Rises", "Energy", "4 min read"]
];

const WELL_DATA = [
  ["How Much Exercise Do You Really Need Each Week?", "Well", fallbackImages[4]],
  ["Simple Habits That Help People Sleep Better", "Health", fallbackImages[5]],
  ["What Doctors Want From Your Wearable Data", "Health", fallbackImages[1]],
  ["A Practical Guide to Eating Better on Busy Days", "Food", fallbackImages[9]],
  ["Why Walking Still Matters for Long-Term Health", "Lifestyle", fallbackImages[0]]
];

const AUDIO_DATA = [
  ["The Headlines", "Morning briefing on politics, markets and world affairs.", fallbackImages[7]],
  ["Markets Podcast", "A quick look at stocks, crypto and economic signals.", fallbackImages[2]],
  ["AI Weekly", "How artificial intelligence is changing business and culture.", fallbackImages[1]],
  ["World Brief", "Global stories explained in clear language.", fallbackImages[6]],
  ["Culture Talk", "Arts, music, books and entertainment analysis.", fallbackImages[8]]
];

function renderMoreNews() {
  const box = document.getElementById("moreNewsGrid");
  if (!box) return;

  box.innerHTML = MORE_NEWS_DATA.map(item => `
    <article class="more-news-card">
      <span>${item[1]}</span>
      <h3>${item[0]}</h3>
      <small>${item[2]}</small>
    </article>
  `).join("");
}

function renderWellSection() {
  const box = document.querySelector(".well-grid");
  if (!box) return;

  box.innerHTML = WELL_DATA.map(item => `
    <article>
      <img loading="lazy" src="${item[2]}" alt="${item[0]}">
      <span class="section-label">${item[1]}</span>
      <h3>${item[0]}</h3>
      <small>Global Intel Times</small>
    </article>
  `).join("");
}

function renderAudioSection() {
  const box = document.querySelector(".audio-grid");
  if (!box) return;

  box.innerHTML = AUDIO_DATA.map(item => `
    <article>
      <img loading="lazy" src="${item[2]}" alt="${item[0]}">
      <span class="section-label">Audio</span>
      <h3>${item[0]}</h3>
      <p>${item[1]}</p>
    </article>
  `).join("");
}

function renderLongHomepageSections() {
  renderMoreNews();
  renderWellSection();
  renderAudioSection();
}
function setupCategoryButtons() {
  document.querySelectorAll(".topicBtn").forEach(btn => {
    btn.onclick = () => searchNews(btn.dataset.topic || DEFAULT_TOPIC);
  });

  document.querySelectorAll(".mega-col a").forEach(link => {
    link.onclick = () => {
      const topic = link.innerText.trim();

      if (topic) {
        searchNews(topic);
      }
    };
  });
}

function setupCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;

  if (localStorage.getItem("cookiesAccepted") === "yes") {
    banner.style.display = "none";
  } else {
    banner.style.display = "flex";
  }
}

function acceptCookies() {
  localStorage.setItem("cookiesAccepted", "yes");

  const banner = document.getElementById("cookieBanner");

  if (banner) {
    banner.style.display = "none";
  }
}

window.acceptCookies = acceptCookies;

function setupNewsletter() {
  const input = document.querySelector(".newsletter-input");
  const btn = document.querySelector(".newsletter-btn");

  if (!input || !btn) return;

  btn.onclick = () => {
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

  if (box) {
    box.textContent = count + " visits today";
  }
}

function updateArticleSEO(article) {
  document.title = `${article.title} | Global Intel Times`;
}

function renderArticlePage() {
  const articleBox = document.getElementById("articleView");
  if (!articleBox) return;

  let articles = [];

  try {
    articles = JSON.parse(localStorage.getItem("articles") || "[]");
  } catch (e) {
    articles = [];
  }

  if (!Array.isArray(articles) || !articles.length) {
    articles = FALLBACK_ARTICLES;
  }

  const id = Number(new URLSearchParams(window.location.search).get("id") || 0);
  const article = articles[id];

  if (!article) {
    articleBox.innerHTML = `
      <h1>Article not found</h1>
      <p>Please go back to the homepage.</p>
    `;
    return;
  }

  updateArticleSEO(article);

  const img = getValidImage(article);

  articleBox.innerHTML = `
    <div class="breadcrumb">
      <a href="./index.html">Home</a> › ${article.section}
    </div>

    <span class="section-label">${article.section}</span>

    <h1>${article.title}</h1>

    <p class="article-meta">
      ${article.source} • ${readingTime(article.description)}
    </p>

    ${
      img
        ? `<img class="article-main-img" src="${img}" alt="${article.title}" onerror="this.remove()">`
        : ""
    }

    <p class="article-intro">${article.description}</p>

    <p>
      Global Intel Times continues to monitor this developing story.
      Additional updates will appear as more verified information becomes available.
    </p>

    ${
      article.link && article.link !== "#"
        ? `<a class="source-link" href="${article.link}" target="_blank" rel="noopener">Original Source</a>`
        : ""
    }
  `;
}

/* ===========================
   INITIALIZE SITE
=========================== */

setupCookieBanner();
setupNewsletter();
setupCategoryButtons();
updateVisitorCount();

setInterval(updateTopMarket, 5000);
updateTopMarket();

if (document.getElementById("articleView")) {

  renderArticlePage();

} else {

  searchNews(DEFAULT_TOPIC);

  setInterval(() => {

    searchNews(DEFAULT_TOPIC);

  }, 300000);

}
