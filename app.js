
/* =========================================================
   GLOBAL INTEL TIMES — app.js v2
   HTML + CSS + Vanilla JS
   Works on GitHub Pages + Vercel API fallback
========================================================= */

"use strict";

/* ================= CONFIG ================= */

const SITE = {
  name: "Global Intel Times",
  url: window.location.origin,
  apiBase: "/api",
  defaultImage:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  fallbackImage:
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80"
};

const BLOCKED_WORDS = [
  "casino",
  "betting",
  "odds",
  "coupon",
  "promo code",
  "sponsored",
  "gambling",
  "lottery",
  "adult",
  "fake",
  "deal",
  "buy now"
];

const TOPICS = [
  "us",
  "world",
  "politics",
  "business",
  "markets",
  "technology",
  "artificial-intelligence",
  "new-york",
  "weather",
  "sports",
  "video",
  "audio",
  "games",
  "cooking",
  "wirecutter",
  "lifestyle",
  "health",
  "science",
  "culture",
  "opinion"
];

/* ================= FALLBACK DATA ================= */

const FALLBACK_ARTICLES = [
  {
    id: "us-election-security",
    title: "Election Officials Prepare New Security Measures Across the U.S.",
    category: "politics",
    section: "U.S.",
    author: "Global Intel Desk",
    image: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=1200&q=80",
    summary: "State and local officials are preparing new voting security measures ahead of a busy political calendar.",
    content:
      "Election officials across the United States are reviewing cybersecurity, staffing, polling access and public communication systems as political activity increases. Officials say the focus is on transparency, voter confidence and faster response to misinformation.",
    source: "#",
    publishedAt: new Date().toISOString()
  },
  {
    id: "wall-street-ai-rally",
    title: "Wall Street Watches AI Stocks as Investors Reassess Growth",
    category: "markets",
    section: "Markets",
    author: "Markets Desk",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    summary: "Technology shares remain in focus as investors evaluate AI demand, earnings and valuation risks.",
    content:
      "Major market indexes are being influenced by large technology companies tied to artificial intelligence. Analysts are watching earnings guidance, cloud spending, chip demand and broader investor sentiment.",
    source: "#",
    publishedAt: new Date().toISOString()
  },
  {
    id: "extreme-weather-us",
    title: "Extreme Weather Alerts Expand Across Major U.S. Cities",
    category: "weather",
    section: "Weather",
    author: "Weather Desk",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    summary: "Weather agencies are monitoring heat, storms and flood risks across multiple regions.",
    content:
      "Several U.S. regions are preparing for changing weather conditions. Emergency agencies are advising residents to follow local alerts, monitor travel conditions and prepare for possible disruptions.",
    source: "#",
    publishedAt: new Date().toISOString()
  },
  {
    id: "ai-regulation-business",
    title: "Businesses Prepare for New AI Rules and Compliance Pressure",
    category: "artificial-intelligence",
    section: "AI",
    author: "Tech Desk",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    summary: "Companies using AI tools are reviewing data safety, transparency and compliance systems.",
    content:
      "Artificial intelligence adoption continues to grow across finance, media, retail and healthcare. Business leaders are now balancing speed, productivity and risk management.",
    source: "#",
    publishedAt: new Date().toISOString()
  },
  {
    id: "new-york-rent-guide",
    title: "New York Renters Face a Competitive Summer Housing Market",
    category: "new-york",
    section: "New York",
    author: "NY Desk",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    summary: "Apartments in popular neighborhoods remain competitive as demand continues across New York City.",
    content:
      "New York renters are comparing prices, commute times and neighborhood access as the market remains competitive. Brokers say preparation and fast decision-making are important.",
    source: "#",
    publishedAt: new Date().toISOString()
  },
  {
    id: "world-economy-watch",
    title: "Global Economy Faces Mixed Signals From Trade and Inflation",
    category: "world",
    section: "World",
    author: "World Desk",
    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80",
    summary: "Economists are watching inflation, trade tensions and consumer demand across major economies.",
    content:
      "Global markets are responding to mixed economic data. Investors and policymakers are watching trade, currency movement and central bank decisions.",
    source: "#",
    publishedAt: new Date().toISOString()
  },
  {
    id: "sports-live-score-roundup",
    title: "Live Scores and Fixtures: U.S. Sports Weekend Preview",
    category: "sports",
    section: "Sports",
    author: "Sports Desk",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    summary: "A packed sports schedule includes basketball, baseball, tennis and soccer fixtures.",
    content:
      "Sports fans are watching league tables, fixtures and player updates as major competitions continue across the U.S. and international calendars.",
    source: "#",
    publishedAt: new Date().toISOString()
  },
  {
    id: "tech-cybersecurity-risk",
    title: "Cybersecurity Teams Warn of Rising Attacks on Small Businesses",
    category: "technology",
    section: "Technology",
    author: "Tech Desk",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    summary: "Security experts say small companies should improve backups, passwords and employee training.",
    content:
      "Cybersecurity threats are increasing for companies of all sizes. Experts recommend multi-factor authentication, stronger backups and better employee awareness.",
    source: "#",
    publishedAt: new Date().toISOString()
  }
];

const SECTION_ORDER = [
  "Top Stories",
  "More To Read",
  "Extreme Weather",
  "Politics",
  "World",
  "Business",
  "Markets",
  "Technology",
  "Artificial Intelligence",
  "New York",
  "Economy",
  "Video",
  "Sports",
  "Live Scores",
  "The Athletic",
  "Wirecutter",
  "Cooking",
  "Lifestyle",
  "Health",
  "Science",
  "Culture",
  "Audio",
  "Games",
  "Opinion",
  "Trending Analysis",
  "Latest Updates"
];

/* ================= STATE ================= */

let allArticles = [];
let visibleArticles = [];
let currentPage = 1;
const PAGE_SIZE = 12;

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initMegaMenu();
  initMobileMenu();
  initSearch();
  initScrollTop();
  initMarketPage();
  initArticlePage();
  initCategoryPage();

  await loadNews();

  renderByPageType();
  updateSEO();
});

/* ================= NEWS LOADING ================= */

async function loadNews() {
  try {
    const live = await fetchLiveNews();
    allArticles = normalizeArticles(live);
  } catch (err) {
    allArticles = [];
  }

  if (!allArticles.length) {
    allArticles = generateFallbackArticles(60);
  }

  allArticles = removeDuplicateArticles(filterBadArticles(allArticles));
  visibleArticles = [...allArticles];
}

async function fetchLiveNews() {
  const res = await fetch(`${SITE.apiBase}/news`, { cache: "no-store" });
  if (!res.ok) throw new Error("API failed");
  const data = await res.json();
  return Array.isArray(data) ? data : data.articles || [];
}

function normalizeArticles(items) {
  return items
    .map((item, index) => ({
      id: slugify(item.id || item.title || `article-${index}`),
      title: cleanText(item.title || "Untitled Story"),
      category: detectCategory(item),
      section: detectSection(item),
      author: item.author || item.source?.name || "Global Intel Desk",
      image: item.image || item.urlToImage || item.thumbnail || SITE.defaultImage,
      summary: cleanText(item.summary || item.description || ""),
      content: cleanText(item.content || item.description || item.summary || ""),
      source: item.url || item.source || "#",
      publishedAt: item.publishedAt || item.date || new Date().toISOString()
    }))
    .filter(a => a.title && a.title.length > 12);
}

function generateFallbackArticles(count = 60) {
  const base = [...FALLBACK_ARTICLES];
  const generated = [];

  for (let i = 0; i < count; i++) {
    const template = base[i % base.length];
    generated.push({
      ...template,
      id: `${template.id}-${i + 1}`,
      title: i < base.length ? template.title : `${template.title}: Full Report ${i + 1}`,
      publishedAt: new Date(Date.now() - i * 3600000).toISOString()
    });
  }

  return generated;
}

/* ================= FILTERS ================= */

function filterBadArticles(articles) {
  return articles.filter(article => {
    const text = `${article.title} ${article.summary}`.toLowerCase();
    return !BLOCKED_WORDS.some(word => text.includes(word));
  });
}

function removeDuplicateArticles(articles) {
  const seen = new Set();

  return articles.filter(article => {
    const key = article.title.toLowerCase().replace(/[^\w]/g, "").slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function detectCategory(article) {
  const text = `${article.title || ""} ${article.description || ""} ${article.summary || ""}`.toLowerCase();

  if (text.includes("ai") || text.includes("artificial intelligence")) return "artificial-intelligence";
  if (text.includes("bitcoin") || text.includes("crypto")) return "markets";
  if (text.includes("stock") || text.includes("market") || text.includes("wall street")) return "markets";
  if (text.includes("weather") || text.includes("storm") || text.includes("heat")) return "weather";
  if (text.includes("new york") || text.includes("nyc")) return "new-york";
  if (text.includes("nba") || text.includes("nfl") || text.includes("mlb") || text.includes("sports")) return "sports";
  if (text.includes("election") || text.includes("white house") || text.includes("senate")) return "politics";
  if (text.includes("tech") || text.includes("cyber")) return "technology";
  if (text.includes("health")) return "health";
  if (text.includes("science")) return "science";
  if (text.includes("world") || text.includes("global")) return "world";

  return article.category || "us";
}

function detectSection(article) {
  const cat = detectCategory(article);
  const map = {
    us: "Top Stories",
    politics: "Politics",
    world: "World",
    business: "Business",
    markets: "Markets",
    technology: "Technology",
    "artificial-intelligence": "Artificial Intelligence",
    "new-york": "New York",
    weather: "Extreme Weather",
    sports: "Sports",
    video: "Video",
    audio: "Audio",
    games: "Games",
    cooking: "Cooking",
    wirecutter: "Wirecutter",
    lifestyle: "Lifestyle",
    health: "Health",
    science: "Science",
    culture: "Culture",
    opinion: "Opinion"
  };

  return map[cat] || "Latest Updates";
}

/* ================= ROUTING ================= */

function renderByPageType() {
  const page = getCurrentPageName();

  if (page.includes("category")) {
    renderCategoryPage();
  } else if (page.includes("article")) {
    renderArticlePage();
  } else if (page.includes("market")) {
    renderMarketDashboard();
  } else {
    renderHomepage();
  }
}

function getCurrentPageName() {
  return location.pathname.split("/").pop() || "index.html";
}

/* ================= HOMEPAGE ================= */

function renderHomepage() {
  renderBreakingTicker();
  renderHero();
  renderEditorialSections();
  renderSidebar();
  renderNewsletter();
  renderFooter();
  initInfiniteScroll();
}

function renderBreakingTicker() {
  const el = document.querySelector("#breakingTicker");
  if (!el) return;

  const items = allArticles.slice(0, 8);
  el.innerHTML = `
    <strong>Breaking</strong>
    <div class="ticker-track">
      ${items.map(a => `<a href="article.html?id=${a.id}">${escapeHTML(a.title)}</a>`).join("")}
    </div>
  `;
}

function renderHero() {
  const el = document.querySelector("#heroNews");
  if (!el) return;

  const main = allArticles[0];
  const side = allArticles.slice(1, 5);

  el.innerHTML = `
    <article class="hero-main">
      <a href="article.html?id=${main.id}">
        <img src="${main.image}" alt="${escapeHTML(main.title)}" loading="eager" onerror="this.src='${SITE.fallbackImage}'">
        <span class="label">${main.section}</span>
        <h1>${escapeHTML(main.title)}</h1>
        <p>${escapeHTML(main.summary || generateAISummary(main))}</p>
      </a>
    </article>

    <div class="hero-side">
      ${side.map(a => articleMiniCard(a)).join("")}
    </div>
  `;
}

function renderEditorialSections() {
  const container = document.querySelector("#newsSections");
  if (!container) return;

  container.innerHTML = "";

  SECTION_ORDER.forEach(section => {
    const articles = getArticlesForSection(section, 6);
    if (!articles.length) return;

    const sectionEl = document.createElement("section");
    sectionEl.className = "editorial-section";
    sectionEl.innerHTML = `
      ${adBlock("section-top")}
      <div class="section-head">
        <h2>${section}</h2>
        <a href="category.html?topic=${slugify(section)}">View all</a>
      </div>
      <div class="article-grid">
        ${articles.map(articleCard).join("")}
      </div>
    `;
    container.appendChild(sectionEl);
  });
}

function getArticlesForSection(section, limit = 6) {
  return allArticles
    .filter(a => a.section === section || a.category === slugify(section))
    .slice(0, limit);
}

/* ================= CATEGORY PAGE ================= */

function initCategoryPage() {
  const search = document.querySelector("#categorySearch");
  if (!search) return;

  search.addEventListener("input", () => {
    renderCategoryPage(search.value.trim());
  });
}

function renderCategoryPage(keyword = "") {
  const container = document.querySelector("#categoryArticles");
  const title = document.querySelector("#categoryTitle");
  if (!container) return;

  const topic = getQueryParam("topic") || "us";
  const topicTitle = titleCase(topic.replace(/-/g, " "));

  if (title) title.textContent = topicTitle;

  let articles = allArticles.filter(a => {
    const categoryMatch =
      a.category === topic ||
      slugify(a.section) === topic ||
      a.title.toLowerCase().includes(topic.replace(/-/g, " "));

    const searchMatch =
      !keyword ||
      a.title.toLowerCase().includes(keyword.toLowerCase()) ||
      a.summary.toLowerCase().includes(keyword.toLowerCase());

    return categoryMatch && searchMatch;
  });

  if (!articles.length) {
    articles = allArticles.filter(a => a.category === "us").slice(0, 12);
  }

  container.innerHTML = articles.map(articleCard).join("");
}

/* ================= ARTICLE PAGE ================= */

function initArticlePage() {
  const shareBtns = document.querySelectorAll("[data-share]");
  shareBtns.forEach(btn => {
    btn.addEventListener("click", () => shareArticle(btn.dataset.share));
  });
}

function renderArticlePage() {
  const root = document.querySelector("#articleRoot");
  if (!root) return;

  const id = getQueryParam("id");
  const article = allArticles.find(a => a.id === id) || allArticles[0];
  const related = getRelatedArticles(article, 4);

  root.innerHTML = `
    <nav class="breadcrumb">
      <a href="index.html">Home</a> / 
      <a href="category.html?topic=${article.category}">${titleCase(article.category)}</a>
    </nav>

    <article class="article-layout">
      <main class="article-main">
        <span class="label">${article.section}</span>
        <h1>${escapeHTML(article.title)}</h1>
        <p class="article-summary">${escapeHTML(article.summary || generateAISummary(article))}</p>

        <div class="article-meta">
          By ${escapeHTML(article.author)} · 
          ${formatDate(article.publishedAt)} · 
          ${readingTime(article.content)} min read
        </div>

        <img class="article-hero-img" src="${article.image}" alt="${escapeHTML(article.title)}" onerror="this.src='${SITE.fallbackImage}'">

        ${adBlock("article-top")}

        <div class="article-body">
          ${formatArticleBody(article.content)}
        </div>

        ${adBlock("article-middle")}

        <div class="share-row">
          <button data-share="copy">Copy Link</button>
          <button data-share="twitter">X</button>
          <button data-share="facebook">Facebook</button>
          <button data-share="whatsapp">WhatsApp</button>
        </div>

        <p class="source-link">
          Source: <a href="${article.source}" target="_blank" rel="nofollow noopener">Original Source</a>
        </p>

        <section class="related">
          <h2>Related Articles</h2>
          <div class="article-grid">
            ${related.map(articleCard).join("")}
          </div>
        </section>
      </main>

      <aside class="article-sidebar">
        ${sidebarHTML()}
      </aside>
    </article>

    <script type="application/ld+json">
      ${JSON.stringify(articleSchema(article))}
    </script>
  `;

  initArticlePage();
}

/* ================= MARKET DASHBOARD ================= */

function initMarketPage() {
  const input = document.querySelector("#marketSearch");
  if (!input) return;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const symbol = input.value.trim().toUpperCase();
      updateTradingView(symbol || "AAPL");
    }
  });
}

function renderMarketDashboard() {
  const root = document.querySelector("#marketRoot");
  if (!root) return;

  root.innerHTML = `
    <section class="market-dashboard">
      <h1>Markets</h1>

      <div class="market-search-box">
        <input id="marketSearch" placeholder="Search AAPL, MSFT, BTC, ETH, GOLD..." />
        <button onclick="updateTradingView(document.querySelector('#marketSearch').value)">Search</button>
      </div>

      <div id="tradingViewBox" class="tradingview-box"></div>

      <div class="market-analysis-grid">
        ${marketAnalysisCard("AI Analysis", "Neutral to bullish momentum with active institutional interest.")}
        ${marketAnalysisCard("Support", "Key support is near the latest consolidation zone.")}
        ${marketAnalysisCard("Resistance", "Resistance may appear near previous swing highs.")}
        ${marketAnalysisCard("Trend", "Trend strength depends on volume confirmation.")}
        ${marketAnalysisCard("Volume", "Volume is being watched for breakout confirmation.")}
        ${marketAnalysisCard("Sentiment", "Market sentiment is mixed but improving.")}
      </div>

      <section>
        <h2>Latest Market News</h2>
        <div class="article-grid">
          ${allArticles.filter(a => a.category === "markets").slice(0, 6).map(articleCard).join("")}
        </div>
      </section>
    </section>
  `;

  updateTradingView("AAPL");
  initMarketPage();
}

function updateTradingView(symbol = "AAPL") {
  const box = document.querySelector("#tradingViewBox");
  if (!box) return;

  const cleanSymbol = normalizeMarketSymbol(symbol);

  box.innerHTML = `
    <iframe
      title="TradingView Chart"
      src="https://s.tradingview.com/widgetembed/?symbol=${cleanSymbol}&interval=D&theme=light&style=1&timezone=America%2FNew_York"
      width="100%"
      height="520"
      frameborder="0"
      allowtransparency="true"
      scrolling="no">
    </iframe>
  `;
}

function normalizeMarketSymbol(symbol) {
  const s = String(symbol || "AAPL").toUpperCase().trim();

  const map = {
    BTC: "BINANCE:BTCUSDT",
    ETH: "BINANCE:ETHUSDT",
    GOLD: "TVC:GOLD",
    SILVER: "TVC:SILVER",
    AAPL: "NASDAQ:AAPL",
    MSFT: "NASDAQ:MSFT",
    NVDA: "NASDAQ:NVDA",
    TSLA: "NASDAQ:TSLA",
    META: "NASDAQ:META",
    GOOGL: "NASDAQ:GOOGL"
  };

  return map[s] || `NASDAQ:${s}`;
}

function marketAnalysisCard(title, text) {
  return `
    <div class="market-card">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

/* ================= SEARCH ================= */

function initSearch() {
  const inputs = document.querySelectorAll("[data-site-search]");
  inputs.forEach(input => {
    input.addEventListener("input", () => showSearchSuggestions(input));
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const q = input.value.trim();
        if (q) location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    });
  });

  renderSearchPage();
}

function showSearchSuggestions(input) {
  const box = document.querySelector("#searchSuggestions");
  if (!box) return;

  const q = input.value.toLowerCase().trim();
  if (!q) {
    box.innerHTML = "";
    return;
  }

  const results = allArticles
    .filter(a => a.title.toLowerCase().includes(q))
    .slice(0, 6);

  box.innerHTML = results
    .map(a => `<a href="article.html?id=${a.id}">${escapeHTML(a.title)}</a>`)
    .join("");
}

function renderSearchPage() {
  const root = document.querySelector("#searchResults");
  if (!root) return;

  const q = getQueryParam("q") || "";
  const results = allArticles.filter(a =>
    `${a.title} ${a.summary} ${a.category}`.toLowerCase().includes(q.toLowerCase())
  );

  root.innerHTML = `
    <h1>Search results for "${escapeHTML(q)}"</h1>
    <div class="article-grid">
      ${(results.length ? results : allArticles.slice(0, 12)).map(articleCard).join("")}
    </div>
  `;
}

/* ================= CARDS ================= */

function articleCard(article) {
  return `
    <article class="article-card">
      <a href="article.html?id=${article.id}">
        <img src="${article.image}" alt="${escapeHTML(article.title)}" loading="lazy" onerror="this.src='${SITE.fallbackImage}'">
        <span class="label">${article.section}</span>
        <h3>${escapeHTML(article.title)}</h3>
        <p>${escapeHTML(article.summary || generateAISummary(article))}</p>
        <time>${formatDate(article.publishedAt)}</time>
      </a>
    </article>
  `;
}

function articleMiniCard(article) {
  return `
    <article class="mini-card">
      <a href="article.html?id=${article.id}">
        <span>${article.section}</span>
        <h3>${escapeHTML(article.title)}</h3>
      </a>
    </article>
  `;
}

/* ================= SIDEBAR ================= */

function renderSidebar() {
  const sidebar = document.querySelector("#sidebar");
  if (!sidebar) return;
  sidebar.innerHTML = sidebarHTML();
}

function sidebarHTML() {
  return `
    ${adBlock("sidebar-top")}

    <section class="sidebar-box">
      <h3>Trending</h3>
      ${allArticles.slice(0, 5).map(sidebarItem).join("")}
    </section>

    <section class="sidebar-box">
      <h3>Most Read</h3>
      ${getMostRead().map(sidebarItem).join("")}
    </section>

    <section class="sidebar-box">
      <h3>Market Watch</h3>
      <ul class="market-list">
        <li>Dow Futures <strong>Live</strong></li>
        <li>Nasdaq <strong>Watching</strong></li>
        <li>Bitcoin <strong>Volatile</strong></li>
        <li>Gold <strong>Steady</strong></li>
      </ul>
    </section>

    <section class="sidebar-box">
      <h3>Trending Analytics</h3>
      ${analyticsHTML()}
    </section>

    ${adBlock("sidebar-bottom")}
  `;
}

function sidebarItem(article) {
  return `
    <a class="sidebar-item" href="article.html?id=${article.id}">
      ${escapeHTML(article.title)}
    </a>
  `;
}

function getMostRead() {
  return [...allArticles]
    .map(a => ({ ...a, score: trendingScore(a) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

/* ================= ANALYTICS ================= */

function trendingScore(article) {
  let score = 50;
  const text = `${article.title} ${article.summary}`.toLowerCase();

  ["breaking", "live", "market", "ai", "weather", "election", "new york"].forEach(word => {
    if (text.includes(word)) score += 10;
  });

  const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / 3600000;
  score += Math.max(0, 24 - hoursOld);

  return Math.round(score);
}

function analyticsHTML() {
  const scores = {
    "AI Score": 87,
    "Market Score": 82,
    "Crypto Score": 76,
    "Politics Score": 79,
    "Weather Score": 84,
    "Technology Score": 88
  };

  return Object.entries(scores)
    .map(([name, value]) => `
      <div class="score-row">
        <span>${name}</span>
        <strong>${value}</strong>
      </div>
    `)
    .join("");
}

/* ================= MEGA MENU ================= */

function initMegaMenu() {
  document.querySelectorAll("[data-mega]").forEach(item => {
    item.addEventListener("mouseenter", () => openMegaMenu(item.dataset.mega));
    item.addEventListener("focus", () => openMegaMenu(item.dataset.mega));
  });

  const menu = document.querySelector("#megaMenu");
  if (menu) {
    menu.addEventListener("mouseleave", closeMegaMenu);
  }
}

function openMegaMenu(topic) {
  const menu = document.querySelector("#megaMenu");
  if (!menu) return;

  const related = allArticles.filter(a => a.category === topic).slice(0, 5);

  menu.innerHTML = `
    <div class="mega-grid">
      ${[1, 2, 3, 4, 5].map(col => `
        <div>
          <h4>${titleCase(topic)} ${col}</h4>
          <a href="category.html?topic=${topic}">Latest</a>
          <a href="category.html?topic=${topic}">Analysis</a>
          <a href="category.html?topic=${topic}">Opinion</a>
          <a href="category.html?topic=${topic}">Newsletter</a>
          <a href="category.html?topic=${topic}">Podcasts</a>
        </div>
      `).join("")}
    </div>

    <div class="mega-featured">
      ${related.map(a => `<a href="article.html?id=${a.id}">${escapeHTML(a.title)}</a>`).join("")}
    </div>
  `;

  menu.classList.add("active");
}

function closeMegaMenu() {
  const menu = document.querySelector("#megaMenu");
  if (menu) menu.classList.remove("active");
}

function initMobileMenu() {
  const btn = document.querySelector("#mobileMenuBtn");
  const nav = document.querySelector("#mainNav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

/* ================= INFINITE SCROLL ================= */

function initInfiniteScroll() {
  window.addEventListener("scroll", () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 700;
    if (nearBottom) loadMoreArticles();
  });
}

function loadMoreArticles() {
  const container = document.querySelector("#infiniteNews");
  if (!container) return;

  const start = currentPage * PAGE_SIZE;
  const next = visibleArticles.slice(start, start + PAGE_SIZE);
  if (!next.length) return;

  container.insertAdjacentHTML("beforeend", next.map(articleCard).join(""));
  currentPage++;
}

/* ================= NEWSLETTER / FOOTER ================= */

function renderNewsletter() {
  const el = document.querySelector("#newsletter");
  if (!el) return;

  el.innerHTML = `
    <section class="newsletter-box">
      <h2>Daily Intelligence Briefing</h2>
      <p>Top U.S., market, technology and world stories delivered every morning.</p>
      <form onsubmit="event.preventDefault(); alert('Thank you for subscribing!')">
        <input type="email" placeholder="Email address" required>
        <button>Subscribe</button>
      </form>
    </section>
  `;
}

function renderFooter() {
  const footer = document.querySelector("#footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer-grid">
      <div>
        <h3>${SITE.name}</h3>
        <p>Independent digital news for U.S. readers.</p>
      </div>
      <div>
        <h4>Sections</h4>
        ${TOPICS.slice(0, 8).map(t => `<a href="category.html?topic=${t}">${titleCase(t)}</a>`).join("")}
      </div>
      <div>
        <h4>Company</h4>
        <a href="#">About</a>
        <a href="#">Contact</a>
        <a href="#">Advertise</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  `;
}

/* ================= ADS ================= */

function adBlock(position = "") {
  return `
    <div class="ad-box" data-ad-position="${position}">
      Advertisement
    </div>
  `;
}

/* ================= THEME ================= */

function initTheme() {
  const saved = localStorage.getItem("git-theme");
  if (saved === "dark") document.body.classList.add("dark");

  const btn = document.querySelector("#themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("git-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

/* ================= SHARE ================= */

function shareArticle(type) {
  const url = location.href;
  const title = document.title;

  if (type === "copy") {
    navigator.clipboard.writeText(url);
    alert("Link copied");
  }

  if (type === "twitter") {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
  }

  if (type === "facebook") {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  }

  if (type === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`);
  }
}

/* ================= UTILITIES ================= */

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(text) {
  return String(text)
    .replace(/-/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function cleanText(text) {
  return String(text || "")
    .replace(/\[\+\d+ chars\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function readingTime(text) {
  const words = String(text || "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

function generateAISummary(article) {
  const text = article.summary || article.content || article.title;
  return cleanText(text).split(".").slice(0, 2).join(".") + ".";
}

function formatArticleBody(content) {
  const text = content || "This developing story will be updated as more information becomes available.";
  const paragraphs = text.split(". ").filter(Boolean);

  return paragraphs
    .map(p => `<p>${escapeHTML(p.trim())}${p.endsWith(".") ? "" : "."}</p>`)
    .join("");
}

function getRelatedArticles(article, limit = 4) {
  return allArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, limit);
}

function initScrollTop() {
  const btn = document.querySelector("#scrollTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 600);
  });

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ================= SEO ================= */

function updateSEO() {
  const page = getCurrentPageName();

  let title = SITE.name;
  let desc = "Global Intel Times delivers U.S., world, markets, technology, weather and culture news.";

  if (page.includes("category")) {
    const topic = getQueryParam("topic") || "news";
    title = `${titleCase(topic)} News - ${SITE.name}`;
    desc = `Latest ${titleCase(topic)} news, analysis and updates.`;
  }

  if (page.includes("article")) {
    const id = getQueryParam("id");
    const article = allArticles.find(a => a.id === id);
    if (article) {
      title = `${article.title} - ${SITE.name}`;
      desc = article.summary;
    }
  }

  document.title = title;
  setMeta("description", desc);
  setMeta("og:title", title);
  setMeta("og:description", desc);
  setMeta("twitter:title", title);
  setMeta("twitter:description", desc);
}

function setMeta(name, content) {
  let tag =
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    if (name.startsWith("og:")) tag.setAttribute("property", name);
    else tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function articleSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: [article.image],
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name
    }
  };
}

/* ================= GLOBAL EXPORTS ================= */

window.updateTradingView = updateTradingView;
window.loadMoreArticles = loadMoreArticles;
