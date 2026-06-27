"use strict";

const SITE_NAME = "Global Intel Times";
const DEFAULT_IMG = "./assets/images/og-image.svg";
const PAGE_LIMIT = 30;
const REFRESH_MS = 60 * 1000;
const API = {
  news: "./api/news",
  videos: "./api/videos",
  weather: "./api/weather",
  markets: "./api/markets",
  crypto: "./api/crypto",
  sports: "./api/sports",
  analytics: "./api/analytics",
  trending: "./api/trending"
};
const TOP_MENU = {
  "U.S.": ["U.S.", "Politics", "Health", "Education", "Immigration", "Crime", "Weather"],
  World: ["World", "Europe", "Asia", "Middle East", "Africa", "Latin America", "Russia Ukraine War"],
  Business: ["Business", "Markets", "Economy", "Companies", "Banking", "Real Estate", "Startups"],
  Tech: ["Technology", "Artificial Intelligence", "Cybersecurity", "Startups", "Software"],
  Markets: ["Markets", "Stocks", "ETF", "Crypto", "Gold", "Oil", "Forex"],
  Lifestyle: ["Lifestyle", "Travel", "Food", "Style", "Health", "Home"],
  Opinion: ["Opinion", "Editorials", "Guest Essays"],
  Video: ["Video", "U.S. Video", "World Video", "Business Video"],
  Sports: ["Sports", "NFL", "NBA", "MLB", "Cricket", "Soccer"]
};
const CATEGORY_RULES = {
  latest: [""], us: ["usa", "america", "american", "white house", "congress", "washington", "u.s."],
  politics: ["politics", "president", "white house", "senate", "congress", "election", "trump", "biden"],
  world: ["world", "china", "russia", "ukraine", "india", "europe", "middle east", "africa", "asia", "israel", "iran"],
  business: ["business", "economy", "company", "finance", "bank", "inflation", "jobs"],
  markets: ["market", "nasdaq", "dow", "s&p", "wall street", "stock", "shares", "earnings"],
  technology: ["technology", "software", "apple", "google", "microsoft", "meta", "amazon", "tesla", "cyber"],
  "artificial-intelligence": ["artificial intelligence", " ai ", "chatgpt", "openai", "gemini", "claude"],
  crypto: ["bitcoin", "btc", "ethereum", "crypto", "blockchain"],
  weather: ["weather", "storm", "rain", "heat", "snow", "hurricane", "flood", "wildfire"],
  sports: ["sports", "nba", "nfl", "mlb", "tennis", "formula 1", "world cup", "soccer", "cricket"],
  health: ["health", "doctor", "hospital", "medical", "medicine", "disease"],
  science: ["science", "space", "research", "nasa", "climate"],
  culture: ["culture", "movie", "music", "book", "museum", "theater"],
  lifestyle: ["travel", "food", "style", "fashion", "home"],
  opinion: ["opinion", "editorial", "essay"]
};

let state = {
  articles: [],
  page: 1,
  hasMore: true,
  loading: false,
  topic: "latest",
  newestSeen: null,
  pendingFresh: [],
  freshButton: null,
  marketQuotes: [],
  weather: null,
  crypto: null,
  sports: []
};

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  state.topic = getParam("topic") || getParam("q") || document.querySelector("[data-topic-page]")?.dataset.topicPage || "latest";
  setupChrome();
  await loadInitialNews();
  renderCurrentPage();
  loadSideData();
  setupInfiniteScroll();
  setupMinuteRefresh();
}

function setupChrome() {
  setHTML("todayDate", new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()));
  setHTML("year", new Date().getFullYear());
  renderMegaMenu();
  initSearch();
  initTheme();
  initScroll();
  renderAds();
}

async function loadInitialNews() {
  if (document.getElementById("articleRoot") && getParam("id")) {
    const data = await getJSON(`${API.news}?id=${encodeURIComponent(getParam("id"))}`);
    if (data.article) state.articles = [normalizeArticle(data.article)];
    state.newestSeen = state.articles[0]?.publishedAt || new Date().toISOString();
    return;
  }
  const data = await fetchNewsPage(1);
  state.articles = normalizeArticles(data.articles || []);
  state.hasMore = Boolean(data.hasMore);
  state.page = 1;
  state.newestSeen = state.articles[0]?.publishedAt || new Date().toISOString();
}

async function fetchNewsPage(page) {
  const topic = encodeURIComponent(state.topic || "latest");
  return getJSON(`${API.news}?topic=${topic}&page=${page}&limit=${PAGE_LIMIT}`);
}

async function loadMoreNews() {
  if (state.loading || !state.hasMore) return;
  state.loading = true;
  const button = document.getElementById("loadMoreBtn");
  if (button) button.textContent = "Loading...";
  try {
    const data = await fetchNewsPage(state.page + 1);
    const more = normalizeArticles(data.articles || []);
    state.articles = removeDuplicates([...state.articles, ...more]);
    state.page += 1;
    state.hasMore = Boolean(data.hasMore);
    appendMoreCards(more);
  } catch (e) {
    console.warn(e);
  } finally {
    state.loading = false;
    if (button) button.textContent = state.hasMore ? "Load more stories" : "No more stories";
  }
}

function setupMinuteRefresh() {
  createFreshButton();
  setInterval(checkForFreshNews, REFRESH_MS);
}

async function checkForFreshNews() {
  if (!state.newestSeen) return;
  try {
    const data = await getJSON(`${API.news}?topic=${encodeURIComponent(state.topic)}&since=${encodeURIComponent(state.newestSeen)}&limit=60`);
    const fresh = removeDuplicates(normalizeArticles(data.articles || []));
    const unseen = fresh.filter(a => !state.articles.some(x => x.id === a.id));
    if (unseen.length) {
      state.pendingFresh = removeDuplicates([...unseen, ...state.pendingFresh]);
      showFreshButton(state.pendingFresh.length);
    }
  } catch (e) {
    console.warn("fresh news check failed", e);
  }
}

function createFreshButton() {
  if (state.freshButton) return;
  const btn = document.createElement("button");
  btn.id = "newStoriesBtn";
  btn.className = "new-stories-btn";
  btn.style.display = "none";
  btn.onclick = () => {
    const fresh = state.pendingFresh.splice(0);
    state.articles = removeDuplicates([...fresh, ...state.articles]);
    state.newestSeen = state.articles[0]?.publishedAt || state.newestSeen;
    hideFreshButton();
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  document.body.appendChild(btn);
  state.freshButton = btn;
}
function showFreshButton(count) { if (state.freshButton) { state.freshButton.textContent = `${count} new stories available`; state.freshButton.style.display = "block"; } }
function hideFreshButton() { if (state.freshButton) state.freshButton.style.display = "none"; }

function setupInfiniteScroll() {
  let sentinel = document.getElementById("infiniteSentinel");
  if (!sentinel && (document.getElementById("moreNewsGrid") || document.getElementById("categoryArticles") || document.querySelector("[data-topic-page]"))) {
    sentinel = document.createElement("div");
    sentinel.id = "infiniteSentinel";
    sentinel.className = "infinite-sentinel";
    sentinel.innerHTML = `<button id="loadMoreBtn" class="load-more-btn">Load more stories</button>`;
    (document.querySelector("main") || document.body).appendChild(sentinel);
    sentinel.querySelector("button").onclick = loadMoreNews;
  }
  if (!sentinel || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) loadMoreNews();
  }, { rootMargin: "700px" });
  observer.observe(sentinel);
}

function renderCurrentPage() {
  renderHeader();
  renderHome();
  renderCategoryPage();
  renderArticlePage();
  renderTopicPage();
  renderSearchPage();
  renderSharedLists();
  updateSEO();
}

function renderHeader() {
  const quote = state.marketQuotes[0] || { symbol: "AAPL", change: 0 };
  setHTML("topMarketTicker", `<a href="./market.html?symbol=${quote.symbol}" class="${Number(quote.change) >= 0 ? "up" : "down"}">${quote.symbol} ${Number(quote.change) >= 0 ? "+" : ""}${Number(quote.change || 0).toFixed(2)}%</a>`);
}

function renderHome() {
  if (!document.getElementById("leadMain")) return;
  const a = state.articles;
  setHTML("breakingTicker", a.slice(0, 25).map(x => `<a href="./article.html?id=${x.id}">${escapeHTML(x.title)}</a>`).join(" &nbsp;&nbsp; "));
  setHTML("leadLeft", smallCard(a[1] || a[0]));
  setHTML("leadMain", bigCard(a[0]));
  setHTML("leadRight", sideList(a.slice(2, 10)));
  setHTML("moreNewsGrid", a.slice(6).map(card).join(""));
  renderTopicSections();
}

function appendMoreCards(more) {
  const moreGrid = document.getElementById("moreNewsGrid");
  const catGrid = document.getElementById("categoryArticles");
  const topicGrid = document.querySelector("[data-topic-page]");
  const html = more.map(card).join("");
  if (moreGrid) moreGrid.insertAdjacentHTML("beforeend", html);
  if (catGrid) catGrid.insertAdjacentHTML("beforeend", html);
  if (topicGrid) topicGrid.insertAdjacentHTML("beforeend", html);
  renderBookmarkButtons();
}

function renderTopicSections() {
  const map = {
    topStoriesSection: ["latest", "Top Stories"], usSection: ["us", "U.S."], worldSection: ["world", "World"], politicsSection: ["politics", "Politics"],
    businessSection: ["business", "Business"], marketsSection: ["markets", "Markets"], aiSection: ["artificial-intelligence", "Artificial Intelligence"], technologySection: ["technology", "Technology"],
    cryptoSection: ["crypto", "Crypto"], weatherSection: ["weather", "Extreme Weather"], healthSection: ["health", "Health"], scienceSection: ["science", "Science"],
    sportsSection: ["sports", "Sports"], lifestyleSection: ["lifestyle", "Lifestyle"], cultureSection: ["culture", "Culture"], opinionSection: ["opinion", "Opinion"]
  };
  Object.keys(map).forEach(id => {
    const box = document.getElementById(id);
    if (!box) return;
    const [topic, title] = map[id];
    const articles = getCategoryArticles(topic).slice(0, 6);
    box.innerHTML = `<section class="editorial-section"><div class="section-heading"><h2>${title}</h2><a href="./category.html?topic=${topic}">View All</a></div><div class="article-grid compact-grid">${articles.length ? articles.map(card).join("") : "<p>No updates right now.</p>"}</div></section>`;
  });
}

function renderCategoryPage() {
  const root = document.getElementById("categoryArticles");
  if (!root) return;
  const topic = getParam("topic") || "latest";
  setHTML("categoryTitle", titleCase(topic));
  setHTML("categoryDescription", `${titleCase(topic)} news updates. New stories are checked every minute and old stories stay available as you scroll.`);
  root.innerHTML = state.articles.length ? state.articles.map(card).join("") : `<p>No ${titleCase(topic)} updates right now.</p>`;
}

function renderTopicPage() {
  const root = document.querySelector("[data-topic-page]");
  if (!root) return;
  root.innerHTML = state.articles.length ? state.articles.map(card).join("") : "<p>No updates right now.</p>";
}

function renderArticlePage() {
  const root = document.getElementById("articleRoot");
  if (!root) return;
  const a = state.articles[0];
  if (!a) { root.innerHTML = "<p>Article not found.</p>"; return; }
  saveRecentlyViewed(a.id);
  root.innerHTML = `<article class="article-detail">
    <div class="article-kicker">${escapeHTML(titleCase(a.section || a.topic || "News"))} • ${escapeHTML(a.sourceName || a.source || "Global Intel")}</div>
    <h1>${escapeHTML(a.title)}</h1>
    <p class="article-summary">${escapeHTML(a.summary || a.description || "")}</p>
    <div class="article-meta">${formatDate(a.publishedAt)} • ${readingTime(a.content || a.summary)} min read • Risk: ${escapeHTML(a.riskLevel || "Low")}</div>
    <img class="article-hero-image" src="${safeAttr(a.image)}" alt="${escapeHTML(a.title)}" loading="eager" onerror="this.src='${DEFAULT_IMG}'">
    <div class="ai-panel"><h3>AI Brief</h3><ul><li>${escapeHTML(a.summary || a.description || "This story is developing.")}</li><li>Importance score: ${Number(a.importance || 50)}/100</li><li>Tags: ${(a.tags || []).map(escapeHTML).join(", ") || "Latest"}</li></ul></div>
    <div class="article-body">${paragraphs(a.content || a.summary || a.description)}</div>
    ${a.url && a.url !== "#" ? `<a class="read-source-btn" href="${safeAttr(a.url)}" target="_blank" rel="noopener">Continue reading at source</a>` : ""}
  </article>`;
}

function renderSearchPage() {
  const root = document.getElementById("searchResults");
  if (!root) return;
  const q = (getParam("q") || "").toLowerCase();
  setHTML("searchQuery", q ? `Search: ${escapeHTML(q)}` : "Search Global Intel Times");
  const results = q ? state.articles.filter(a => articleText(a).includes(q)) : state.articles;
  root.innerHTML = results.length ? results.map(card).join("") : "<p>No matching stories yet.</p>";
}

function renderSharedLists() {
  const a = state.articles;
  setHTML("trendingStories", sideList(a.slice(0, 8), true));
  setHTML("mostRead", sideList(a.slice(8, 16), true));
  setHTML("latestUpdates", sideList(a.slice(0, 12), true));
  setHTML("newsletterBox", `<p>Get the daily intelligence briefing.</p><input placeholder="Email address"><button>Subscribe</button>`);
  renderBookmarkButtons();
}

async function loadSideData() {
  const symbol = (getParam("symbol") || "AAPL").toUpperCase();
  const calls = await Promise.allSettled([
    getJSON(`${API.weather}?city=New York`),
    getJSON(`${API.crypto}?coin=${symbol === "ETH" ? "ethereum" : "bitcoin"}`),
    getJSON(`${API.markets}?watchlist=AAPL,MSFT,NVDA,TSLA,META,GOOGL,AMZN,BTC,ETH,GOLD,SILVER,OIL`),
    getJSON(API.sports),
    getJSON(API.analytics)
  ]);
  state.weather = calls[0].status === "fulfilled" ? calls[0].value : null;
  state.crypto = calls[1].status === "fulfilled" ? calls[1].value : null;
  state.marketQuotes = calls[2].status === "fulfilled" ? (calls[2].value.quotes || []) : [];
  state.sports = calls[3].status === "fulfilled" ? (calls[3].value.scores || []) : [];
  renderWidgets();
  renderHeader();
}

function renderWidgets() {
  const q = state.marketQuotes.length ? state.marketQuotes : [{ symbol: "AAPL", change: 0 }, { symbol: "NVDA", change: 0 }, { symbol: "BTC", change: 0 }];
  setHTML("homeMarketBoard", q.map(x => `<a class="market-pill ${Number(x.change) >= 0 ? "up" : "down"}" href="./market.html?symbol=${x.symbol}"><span>${escapeHTML(x.symbol)}</span><strong>${Number(x.change) >= 0 ? "+" : ""}${Number(x.change || 0).toFixed(2)}%</strong></a>`).join(""));
  const w = state.weather || {};
  setHTML("weatherBox", `<div class="weather-card"><h3>${escapeHTML(w.city || "New York")}</h3><strong>${w.temp ?? "--"}°</strong><p>${escapeHTML(w.condition || "Live forecast")}</p><small>Humidity ${w.humidity ?? "--"}% • Wind ${w.wind ?? "--"}</small></div>`);
  const c = state.crypto || {};
  setHTML("cryptoBox", `<div class="crypto-card"><h3>${escapeHTML(titleCase(c.name || "Bitcoin"))}</h3><strong>$${formatNumber(c.price || 0)}</strong><p>${escapeHTML(c.sentiment || "Live crypto update")}</p></div>`);
  const scores = state.sports.length ? state.sports : [{ league: "Sports", homeTeam: "Live", awayTeam: "Scores", homeScore: 0, awayScore: 0 }];
  setHTML("sportsStrip", scores.slice(0, 8).map(s => `<a href="./category.html?topic=sports"><strong>${escapeHTML(s.league || "Sports")}</strong><span>${escapeHTML(s.homeTeam || "Home")} ${s.homeScore ?? 0} — ${s.awayScore ?? 0} ${escapeHTML(s.awayTeam || "Away")}</span></a>`).join(""));
}

function bigCard(a) {
  if (!a) return loadingCard();
  return `<article class="hero-card"><a href="./article.html?id=${a.id}"><div class="card-image-wrap"><img src="${safeAttr(a.image)}" alt="${escapeHTML(a.title)}" loading="eager" onerror="this.src='${DEFAULT_IMG}'"></div><div class="card-body"><span>${escapeHTML(titleCase(a.section || a.topic))}</span><h1>${escapeHTML(a.title)}</h1><p>${escapeHTML(a.summary || a.description)}</p><small>${escapeHTML(a.sourceName || a.source || "Global Intel")} • ${formatDate(a.publishedAt)}</small></div></a></article>`;
}
function smallCard(a) { return a ? `<div class="stack-card">${card(a)}</div>` : loadingCard(); }
function card(a) {
  if (!a) return loadingCard();
  return `<article class="news-card"><a href="./article.html?id=${a.id}"><div class="card-image-wrap"><img src="${safeAttr(a.image)}" alt="${escapeHTML(a.title)}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'"></div><div class="card-body"><span class="section-tag">${escapeHTML(titleCase(a.section || a.topic || "News"))}</span><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.summary || a.description || "")}</p><small>${escapeHTML(a.sourceName || a.source || "Global Intel")} • ${formatDate(a.publishedAt)}</small></div></a></article>`;
}
function sideList(items, compact = false) {
  return (items || []).map(a => `<a class="side-story ${compact ? "compact" : ""}" href="./article.html?id=${a.id}"><strong>${escapeHTML(a.title)}</strong><span>${escapeHTML(a.sourceName || a.source || "Global Intel")} • ${formatDate(a.publishedAt)}</span></a>`).join("");
}
function loadingCard() { return `<article class="news-card skeleton-card"><div class="card-image-wrap"></div><div class="card-body"><h3>Loading latest intelligence...</h3><p>Please wait.</p></div></article>`; }

function normalizeArticles(items) { return removeDuplicates((items || []).map(normalizeArticle)); }
function normalizeArticle(item) {
  const title = cleanText(item.title || "News Update");
  const summary = cleanText(item.summary || item.description || item.content || "Latest update from Global Intel Times.");
  return {
    id: slugify(item.id || title),
    title,
    summary,
    description: summary,
    content: cleanText(item.content || summary),
    image: item.image || item.urlToImage || item.thumbnail || DEFAULT_IMG,
    publishedAt: item.publishedAt || new Date().toISOString(),
    source: item.source || item.url || "Global Intel",
    sourceName: item.sourceName || item.source || host(item.url || item.source || ""),
    url: item.url || item.source || "#",
    section: item.section || item.topic || detectTopic(`${title} ${summary}`),
    topic: item.topic || item.section || detectTopic(`${title} ${summary}`),
    riskLevel: item.riskLevel || "Low",
    importance: item.importance || 50,
    tags: item.tags || []
  };
}
function removeDuplicates(list) {
  const seen = new Set();
  return list.filter(a => {
    const key = slugify((a.url && a.url !== "#" ? a.url : a.title)).slice(0, 120);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function getCategoryArticles(topic) {
  if (topic === "latest") return state.articles;
  const words = CATEGORY_RULES[topic] || [topic.replace(/-/g, " ")];
  return state.articles.filter(a => words.some(w => !w || articleText(a).includes(w.toLowerCase())) || a.topic === topic || a.section === topic);
}
function articleText(a) { return `${a.title || ""} ${a.summary || ""} ${a.category || ""} ${a.topic || ""} ${a.section || ""}`.toLowerCase(); }
function detectTopic(text) {
  const value = ` ${cleanText(text).toLowerCase()} `;
  for (const t in CATEGORY_RULES) if (t !== "latest" && CATEGORY_RULES[t].some(w => w && value.includes(w))) return t;
  return "us";
}

function renderMegaMenu() {
  const nav = document.getElementById("megaNav"), panel = document.getElementById("megaMenuPanel");
  if (!nav || !panel) return;
  nav.innerHTML = Object.keys(TOP_MENU).map(n => `<a class="mega-nav-link" data-menu="${n}" href="./category.html?topic=${slugify(n)}">${n}⌄</a>`).join("");
  nav.querySelectorAll("[data-menu]").forEach(link => { link.onmouseenter = () => openMega(link.dataset.menu); });
  panel.onmouseleave = () => panel.classList.remove("active");
}
function openMega(name) {
  const panel = document.getElementById("megaMenuPanel"), items = TOP_MENU[name] || [];
  panel.innerHTML = `<div class="mega-inner"><div><h2>${escapeHTML(name)}</h2><p>Premium ${escapeHTML(name)} coverage and intelligence.</p></div><div class="mega-col">${items.map(x => `<a href="./category.html?topic=${slugify(x)}">${escapeHTML(x)}</a>`).join("")}</div></div>`;
  panel.classList.add("active");
}
function initSearch() {
  const overlay = document.getElementById("searchOverlay"), openBtn = document.getElementById("searchOpenBtn"), closeBtn = document.getElementById("searchCloseBtn"), input = document.getElementById("globalSearchInput");
  if (openBtn && overlay) openBtn.onclick = () => overlay.classList.add("active");
  if (closeBtn && overlay) closeBtn.onclick = () => overlay.classList.remove("active");
  if (input) {
    input.oninput = () => showSearchSuggestions(input.value);
    input.onkeydown = e => { if (e.key === "Enter" && input.value.trim()) location.href = `./search.html?q=${encodeURIComponent(input.value.trim())}`; };
  }
}
function showSearchSuggestions(q) {
  const box = document.getElementById("searchSuggestions"); if (!box) return;
  q = q.trim().toLowerCase();
  box.innerHTML = q ? state.articles.filter(a => articleText(a).includes(q)).slice(0, 12).map(a => `<a href="./article.html?id=${a.id}">${escapeHTML(a.title)}</a>`).join("") : "";
}
function initTheme() { const b = document.getElementById("themeToggle"); if (localStorage.getItem("git-theme") === "dark") document.body.classList.add("dark"); if (b) b.onclick = () => { document.body.classList.toggle("dark"); localStorage.setItem("git-theme", document.body.classList.contains("dark") ? "dark" : "light"); }; }
function initScroll() { const bar = document.getElementById("readingProgress"), top = document.getElementById("scrollTopBtn"); addEventListener("scroll", () => { if (bar) { const h = document.body.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%"; } if (top) top.classList.toggle("show", scrollY > 600); }); if (top) top.onclick = () => scrollTo({ top: 0, behavior: "smooth" }); }
function renderBookmarkButtons() { document.querySelectorAll(".news-card,.hero-card").forEach(el => { if (el.querySelector(".bookmark-btn")) return; const link = el.querySelector("a"); if (!link) return; const id = new URL(link.href).searchParams.get("id"); const btn = document.createElement("button"); btn.className = "bookmark-btn"; btn.textContent = "♡"; btn.onclick = e => { e.preventDefault(); e.stopPropagation(); const list = JSON.parse(localStorage.getItem("git-bookmarks") || "[]"); if (!list.includes(id)) list.push(id); localStorage.setItem("git-bookmarks", JSON.stringify(list)); btn.textContent = "♥"; }; el.appendChild(btn); }); }
function saveRecentlyViewed(id) { const list = JSON.parse(localStorage.getItem("git-recent") || "[]"); localStorage.setItem("git-recent", JSON.stringify([id].concat(list.filter(x => x !== id)).slice(0, 50))); }
function renderAds() { document.querySelectorAll("[data-ad]").forEach(ad => { ad.innerHTML = "Advertisement"; ad.classList.add("ad-box"); }); }
async function getJSON(url) { const r = await fetch(url, { cache: "no-store" }); if (!r.ok) throw Error(`API failed: ${url}`); return r.json(); }
function updateSEO() { const topic = getParam("topic"), id = getParam("id"); if (topic) document.title = `${titleCase(topic)} News | ${SITE_NAME}`; if (id && state.articles[0]) document.title = `${state.articles[0].title} | ${SITE_NAME}`; }
function cleanText(v) { const div = document.createElement("div"); div.innerHTML = String(v || ""); return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim(); }
function slugify(v) { return String(v || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 120) || "story"; }
function titleCase(v) { return String(v || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function getParam(n) { return new URLSearchParams(location.search).get(n); }
function setHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html || ""; }
function escapeHTML(v) { return String(v || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function safeAttr(v) { return escapeHTML(String(v || DEFAULT_IMG)); }
function formatNumber(v) { return Number(v || 0).toLocaleString("en-US"); }
function formatDate(v) { const d = new Date(v || Date.now()); return Number.isNaN(d.getTime()) ? "Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function readingTime(v) { return Math.max(1, Math.ceil(String(v || "").split(/\s+/).length / 220)); }
function paragraphs(v) { return String(v || "This story is developing.").split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 10).map(p => `<p>${escapeHTML(p)}</p>`).join(""); }
function host(v) { try { return new URL(v).hostname.replace(/^www\./, ""); } catch { return "Global Intel"; } }
