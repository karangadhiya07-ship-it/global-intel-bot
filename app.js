/* GLOBAL INTEL TIMES — COMPLETE app.js */

"use strict";

/* ================= CONFIG ================= */

const SITE_NAME = "Global Intel Times";
const API_URL = "/api/news";

const DEFAULT_IMG =
"https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200";

const TOP_MENU = {
"U.S.": {
desc: "U.S. news, politics, courts, education, weather and local coverage.",
cols: [
["Sections", "U.S.", "Politics", "New York", "California", "Education", "Health", "Science"],
["More", "Climate", "Weather", "Sports", "Business", "Tech", "Crime", "Immigration"],
["Top Stories", "Donald Trump", "Supreme Court", "Congress", "White House", "Abortion"],
["Newsletters", "The Morning", "The Evening", "U.S. Briefing"],
["Podcasts", "The Daily", "Politics Podcast", "See all podcasts"]
]
},

"World": {
desc: "Global news, war, diplomacy, climate and international affairs.",
cols: [
["Sections", "World", "Africa", "Americas", "Asia", "Australia", "Canada", "Europe"],
["More", "Middle East", "Russia Ukraine War", "China", "Climate", "Weather"],
["Top Stories", "Middle East Crisis", "Global Economy", "Europe News", "China Relations"],
["Newsletters", "The World", "Global Update", "Canada Letter"],
["Podcasts", "World Briefing", "Global Dispatch"]
]
},

"Business": {
desc: "Business, economy, markets, finance, technology and money.",
cols: [
["Sections", "Business", "Tech", "Economy", "Media", "Finance and Markets"],
["More", "DealBook", "Personal Tech", "Energy Transition", "Your Money", "Real Estate"],
["Top Stories", "Stock Market", "Artificial Intelligence", "Bitcoin", "Crypto", "Banking"],
["Newsletters", "DealBook", "On Tech", "Markets Briefing"],
["Podcasts", "Hard Fork", "Business Daily"]
]
},

"Arts": {
desc: "Movies, music, books, theater, visual arts and culture.",
cols: [
["Sections", "Today’s Arts", "Book Review", "Best Sellers", "Movies", "Music"],
["More", "Television", "Theater", "Pop Culture", "T Magazine", "Visual Arts"],
["Recommendations", "Best Movies", "Critic’s Picks", "What to Read", "What to Watch"],
["Newsletters", "Books", "Watching"],
["Podcasts", "Book Review", "Culture Podcast"]
]
},

"Lifestyle": {
desc: "Travel, health, food, style, relationships and daily life.",
cols: [
["Sections", "Lifestyle", "Food", "Well", "Love", "Travel", "Style", "Real Estate"],
["Columns", "36 Hours", "Ask Well", "Modern Love", "Where to Eat"],
["Topics", "Health", "Fitness", "Relationships", "Home", "Money"],
["Newsletters", "The Weekender", "Well"],
["Podcasts", "Modern Love"]
]
},

"Opinion": {
desc: "Editorials, guest essays, opinion columns and analysis.",
cols: [
["Sections", "Opinion", "Guest Essays", "Editorials", "Op-Docs", "Letters"],
["Topics", "Politics", "World", "Business", "Tech", "Climate", "Health"],
["Columnists", "Politics Opinion", "Business Opinion", "World Opinion", "Tech Opinion"],
["Featured", "Debate", "Editorial Board"],
["Podcasts", "The Opinions", "Opinion Audio"]
]
},

"Video": {
desc: "Videos, explainers, documentaries and visual investigations.",
cols: [
["Playlists", "Today’s Videos", "U.S. Video", "Politics Video", "World Video"],
["More", "Science Video", "Business Video", "Culture Video", "Books Video"],
["World", "Africa", "Americas", "Asia", "South Asia"],
["Top Stories", "Donald Trump", "Middle East Crisis", "Visual Investigations"],
["More Video", "Opinion Video", "See all videos"]
]
},

"Audio": {
desc: "Audio journalism, podcasts and daily briefings.",
cols: [
["Listen", "The Headlines", "The Daily", "Hard Fork", "The Ezra Klein Show"],
["Shows", "The Opinions", "Serial Productions", "Book Review Podcast", "Modern Love"],
["Featured", "Reporter Reads", "The Interview", "Markets Audio"],
["Newsletters", "Audio", "Serial"],
["More", "Politics Audio", "Culture Audio"]
]
},

"Games": {
desc: "Daily puzzles, word games and logic challenges.",
cols: [
["Play", "Wordle", "Connections", "Sudoku", "Mini Crossword", "Spelling Bee"],
["More", "Strands", "Pips", "Tiles", "Letter Boxed", "Crossword"],
["Community", "Spelling Bee Forum", "Wordplay Column", "Wordle Review"],
["Newsletters", "Gameplay", "Easy Mode"],
["Archive", "Puzzle Archive", "Daily Challenge"]
]
},

"Cooking": {
desc: "Recipes, cooking ideas, healthy food and dinner inspiration.",
cols: [
["Recipes", "Recipes", "Breakfast", "Dinner", "Healthy", "Dessert"],
["More", "Easy", "Vegetarian", "Vegan", "Chicken", "Pasta"],
["Editors’ Picks", "Easy Salmon Recipes", "Grilling Recipes", "Newest Recipes"],
["Newsletters", "Cooking Newsletter", "The Veggie"],
["Guides", "Meal Plan", "Kitchen Tips"]
]
},

"Wirecutter": {
desc: "Product reviews, recommendations and buying guides.",
cols: [
["Reviews", "Kitchen", "Tech", "Sleep", "Appliances", "Home and Garden"],
["More", "Travel", "Gifts", "Deals", "Baby and Kid", "Health and Fitness"],
["The Best", "Air Purifier", "Electric Toothbrush", "Office Chair", "Robot Vacuum"],
["Newsletters", "The Recommendation", "Clean Everything"],
["Guides", "Best Picks", "Shopping Guides"]
]
},

"The Athletic": {
desc: "Sports coverage, leagues, live scores and analysis.",
cols: [
["Leagues", "NFL", "NBA", "MLB", "NHL", "Premier League", "College Football"],
["More", "Tennis", "Formula 1", "WNBA", "NCAA Men’s", "NCAA Women’s"],
["Top Stories", "World Cup", "Live Scores", "Standings", "Fantasy"],
["Newsletters", "The Pulse", "World Cup Briefing"],
["Play", "Connections Sports", "Power Rankings"]
]
}
};

/* ================= DATA ================= */

let allArticles = [];

const FALLBACK_ARTICLES = [
a("new-york", "New York City Renters Face Another Competitive Summer Market", "New York", "New York housing demand remains high as renters compare prices, neighborhoods and commute times."),
a("politics", "White House Faces New Pressure as Congress Debates Spending Plan", "Politics", "Lawmakers are negotiating spending priorities as agencies prepare for policy changes."),
a("business", "Wall Street Watches Tech Shares as Market Momentum Shifts", "Business", "Investors are tracking earnings, AI demand and interest-rate expectations."),
a("artificial-intelligence", "Artificial Intelligence Rules Push Companies to Review Risk Systems", "Artificial Intelligence", "Businesses using AI tools are reviewing transparency, privacy and compliance standards."),
a("weather", "Extreme Weather Alerts Expand Across Major U.S. Cities", "Weather", "Officials are monitoring storms, heat and flooding risks across several regions."),
a("world", "Global Leaders Weigh New Diplomacy Efforts Amid Regional Tensions", "World", "International officials are watching trade, security and humanitarian issues."),
a("stock-market", "Stock Market Opens Mixed as Investors Watch Inflation Data", "Stock Market", "Major indexes moved cautiously as traders waited for fresh economic numbers."),
a("bitcoin", "Bitcoin Traders Watch Key Level After Crypto Market Volatility", "Bitcoin", "Crypto investors are monitoring liquidity, sentiment and institutional flows."),
a("tech", "Cybersecurity Teams Warn Small Businesses About Rising Attacks", "Tech", "Experts recommend stronger backups, password controls and employee training."),
a("health", "Hospitals Expand Digital Tools to Improve Patient Care", "Health", "Medical groups are testing technology to reduce wait times and improve communication."),
a("science", "Scientists Track Climate Signals Across the Atlantic", "Science", "Researchers say ocean temperature changes may influence weather patterns."),
a("sports", "World Cup Live Scores and Fixtures Draw U.S. Fan Attention", "Sports", "Fans are following standings, fixtures and team updates throughout the tournament."),
a("nfl", "NFL Teams Prepare for Training Camp With Roster Questions", "NFL", "Coaches are evaluating depth charts, injuries and early-season strategy."),
a("nba", "NBA Offseason Moves Reset Expectations for Contenders", "NBA", "Front offices continue to adjust rosters before the new season."),
a("mlb", "MLB Playoff Race Tightens as Summer Schedule Intensifies", "MLB", "Teams are watching injuries, pitching depth and trade deadline decisions."),
a("formula-1", "Formula 1 Teams Face Critical Setup Decisions Before Race Weekend", "Formula 1", "Engineers are comparing tire data, weather and track conditions."),
a("tennis", "Tennis Stars Prepare for a Busy Grand Slam Stretch", "Tennis", "Players are balancing fitness, form and schedule pressure."),
a("arts", "New Film Releases Lead a Busy Weekend for Arts Coverage", "Arts", "Critics are reviewing movies, music and theater openings."),
a("movies", "Streaming Platforms Compete for Summer Movie Audiences", "Movies", "Studios are testing release windows and subscription strategies."),
a("music", "Music Festivals Draw Crowds as Summer Tours Expand", "Music", "Artists are announcing new dates and festival appearances."),
a("lifestyle", "Travelers Compare Costs as Summer Trips Get More Expensive", "Lifestyle", "Families are planning trips around flight prices and hotel availability."),
a("food", "Healthy Dinner Ideas Gain Popularity With Busy Families", "Food", "Simple recipes and meal planning are driving cooking interest."),
a("cooking", "Easy Dinner Recipes for a Fast Weeknight Meal", "Cooking", "Home cooks are looking for quick, affordable and healthy dinner options."),
a("opinion", "Opinion: America’s Political Debate Needs More Local Reality", "Opinion", "Local issues are shaping national conversations in important ways."),
a("video", "Video Explainer: Why Weather Risk Is Rising in U.S. Cities", "Video", "A visual report explains how heat, storms and infrastructure risk connect."),
a("audio", "Daily Briefing: Markets, Politics and Technology in 10 Minutes", "Audio", "Today’s audio briefing covers the stories readers are following."),
a("games", "Daily Games: Wordle, Connections and Mini Crossword", "Games", "Puzzle fans return for daily challenges and logic games."),
a("wirecutter", "Best Budget Tech Picks for Students and Remote Workers", "Wirecutter", "Reviewers compare useful products for everyday work and study."),
a("california", "California Cities Prepare New Rules for Housing and Transit", "California", "Officials are weighing new plans for mobility, zoning and climate resilience."),
a("education", "Schools Expand Career Programs as Students Seek Practical Skills", "Education", "Districts are adding technology, business and health pathways.")
];

function a(topic, title, section, summary) {
return {
id: slugify(title),
topic,
category: topic,
section,
title,
summary,
content: summary + " This report will be updated with more details, analysis and background information.",
author: "Global Intel Desk",
image: DEFAULT_IMG,
publishedAt: new Date().toISOString(),
source: "#"
};
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", async () => {
updateDate();
updateTopTrend();
initMegaNavigation();

await loadNews();

renderBreakingTicker();
renderHomeCards();
renderMoreNews();
renderWell();
renderAudio();
renderCategoryPage();

updateSEO();
});

/* ================= LOAD NEWS ================= */

async function loadNews() {
try {
const res = await fetch(API_URL, { cache: "no-store" });
if (!res.ok) throw new Error("API failed");
const data = await res.json();
const live = Array.isArray(data) ? data : data.articles || [];
allArticles = normalizeArticles(live);
} catch {
allArticles = [];
}

if (!allArticles.length) allArticles = [...FALLBACK_ARTICLES];

allArticles = removeDuplicates(filterBadNews(allArticles));

if (allArticles.length < 30) {
allArticles = [...allArticles, ...FALLBACK_ARTICLES].slice(0, 60);
}
}

function normalizeArticles(items) {
return items.map((item, i) => {
const title = clean(item.title || `News Update ${i + 1}`);
const text = `${title} ${item.description || ""} ${item.summary || ""}`;
const topic = detectTopic(text);

```
return {
  id: slugify(item.id || title),
  topic,
  category: topic,
  section: titleCase(topic),
  title,
  summary: clean(item.description || item.summary || item.content || "Latest update from Global Intel Times."),
  content: clean(item.content || item.description || item.summary || ""),
  author: item.author || item.source?.name || "Global Intel Desk",
  image: item.urlToImage || item.image || item.thumbnail || DEFAULT_IMG,
  publishedAt: item.publishedAt || new Date().toISOString(),
  source: item.url || "#"
};
```

});
}

function filterBadNews(list) {
const bad = ["casino", "betting", "odds", "coupon", "promo", "sponsored", "adult", "gambling"];
return list.filter(x => !bad.some(w => `${x.title} ${x.summary}`.toLowerCase().includes(w)));
}

function removeDuplicates(list) {
const seen = new Set();
return list.filter(x => {
const key = slugify(x.title).slice(0, 80);
if (seen.has(key)) return false;
seen.add(key);
return true;
});
}

/* ================= MEGA NAVIGATION ================= */

function initMegaNavigation() {
const nav = document.getElementById("megaNav");
const wrap = document.getElementById("megaMenuWrap");
if (!nav || !wrap) return;

nav.innerHTML = Object.keys(TOP_MENU).map(name => `     <a class="mega-nav-link" href="category.html?topic=${slugify(name)}" data-menu="${name}">
      ${name} <span>⌄</span>     </a>
  `).join("");

nav.querySelectorAll("[data-menu]").forEach(link => {
link.addEventListener("mouseenter", () => openMegaPanel(link.dataset.menu));
link.addEventListener("click", e => {
if (window.innerWidth > 768) return;
e.preventDefault();
openMegaPanel(link.dataset.menu);
});
});

wrap.addEventListener("mouseenter", () => wrap.classList.add("active"));
wrap.addEventListener("mouseleave", closeMegaPanel);

document.addEventListener("click", e => {
if (!nav.contains(e.target) && !wrap.contains(e.target)) closeMegaPanel();
});
}

function openMegaPanel(menuName) {
  const wrap = document.getElementById("megaMenuWrap");
  const menu = TOP_MENU[menuName];

  if (!wrap || !menu) return;

  let html = "";
  html += '<div class="nyt-panel">';
  html += '<div class="nyt-panel-title">';
  html += '<h2>' + menuName + '</h2>';
  html += '<p>' + menu.desc + '</p>';
  html += '</div>';

  menu.cols.forEach(function (col) {
    html += '<div class="nyt-panel-col">';
    html += '<h4>' + col[0] + '</h4>';

    for (let i = 1; i < col.length; i++) {
      html += '<a href="category.html?topic=' + slugify(col[i]) + '">' + col[i] + '</a>';
    }

    html += '</div>';
  });

  html += '</div>';

  wrap.innerHTML = html;
  wrap.classList.add("active");
}

function closeMegaPanel() {
const wrap = document.getElementById("megaMenuWrap");
if (wrap) wrap.classList.remove("active");
}

/* ================= HOME RENDER ================= */

function renderBreakingTicker() {
const box = document.getElementById("breakingTicker");
if (!box) return;

box.innerHTML = allArticles.slice(0, 6)
.map(x => `<a href="article.html?id=${x.id}">${x.title}</a>`)
.join("  •  ");
}

function renderHomeCards() {
setHTML("leadLeft", smallCard(allArticles[1]));
setHTML("leadMain", bigCard(allArticles[0]));
setHTML("leadRight", sideList(allArticles.slice(2, 6)));
}

function renderMoreNews() {
const box = document.getElementById("moreNewsGrid");
if (!box) return;
box.innerHTML = allArticles.slice(6, 30).map(card).join("");
}

function renderWell() {
const box = document.querySelector(".well-grid");
if (!box) return;
box.innerHTML = topicArticles("health").concat(topicArticles("lifestyle")).slice(0, 4).map(card).join("");
}

function renderAudio() {
const box = document.querySelector(".audio-grid");
if (!box) return;

const audio = [
["The Daily Briefing", "Markets, politics and world news in 10 minutes."],
["Hard Fork", "Technology, AI and culture explained."],
["Markets Audio", "Daily business and finance updates."],
["Culture Podcast", "Books, movies, music and ideas."]
];

box.innerHTML = audio.map(x => `     <div class="audio-card">       <h3>${x[0]}</h3>       <p>${x[1]}</p>       <button>▶ Listen</button>     </div>
  `).join("");
}

/* ================= CATEGORY STRICT PAGE ================= */

function renderCategoryPage() {
  const root = document.getElementById("categoryArticles");
  if (!root) return;

  const topic = getParam("topic") || "us";
  const readable = titleCase(topic);
  const title = document.getElementById("categoryTitle");

  if (title) title.textContent = readable;

  const articles = strictTopicArticles(topic);

  let html = "";
  html += '<section class="category-header">';
  html += '<p>GLOBAL INTEL TIMES</p>';
  html += '<h1>' + readable + '</h1>';
  html += '<span>Only ' + readable + ' related news appears on this page.</span>';
  html += '</section>';

  if (articles.length) {
    html += '<div class="article-grid">';
    html += articles.map(card).join("");
    html += '</div>';
  } else {
    html += '<div class="empty-topic">';
    html += '<h2>No ' + readable + ' news found right now.</h2>';
    html += '<p>This page is strictly filtered, so unrelated articles will not appear here.</p>';
    html += '</div>';
  }

  root.innerHTML = html;
}

function strictTopicArticles(topic) {
const t = cleanTopic(topic);

return allArticles.filter(article => {
const articleTopic = cleanTopic(article.topic || article.category || article.section);
const text = cleanTopic(`${article.title} ${article.summary} ${article.content} ${article.section}`);

```
return articleTopic === t || text.includes(t);
```

});
}

function topicArticles(topic) {
return allArticles.filter(x => cleanTopic(x.topic) === cleanTopic(topic));
}

/* ================= ARTICLE PAGE SUPPORT ================= */

function renderArticlePage() {
const root = document.getElementById("articleRoot");
if (!root) return;

const id = getParam("id");
const article = allArticles.find(x => x.id === id) || allArticles[0];

root.innerHTML = `     <article class="article-page">       <p class="breadcrumb"><a href="index.html">Home</a> / ${article.section}</p>       <h1>${article.title}</h1>       <p>${article.summary}</p>       <div class="article-meta">By ${article.author} • ${formatDate(article.publishedAt)} • ${readingTime(article.content)} min read</div>       <img src="${article.image}" alt="${article.title}" onerror="this.src='${DEFAULT_IMG}'">       <div class="article-body">${paragraphs(article.content)}</div>       <p><a href="${article.source}" target="_blank" rel="nofollow noopener">Source link</a></p>     </article>
  `;
}

/* ================= CARDS ================= */

function card(x) {
if (!x) return "";
return `     <article class="news-card">       <a href="article.html?id=${x.id}">         <img src="${x.image}" alt="${x.title}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">         <span>${x.section}</span>         <h3>${x.title}</h3>         <p>${x.summary}</p>       </a>     </article>
  `;
}

function bigCard(x) {
if (!x) return "";
return `     <article class="lead-card main-lead">       <a href="article.html?id=${x.id}">         <img src="${x.image}" alt="${x.title}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">         <span>${x.section}</span>         <h2>${x.title}</h2>         <p>${x.summary}</p>       </a>     </article>
  `;
}

function smallCard(x) {
if (!x) return "";
return `     <article class="lead-card">       <a href="article.html?id=${x.id}">         <span>${x.section}</span>         <h2>${x.title}</h2>         <p>${x.summary}</p>       </a>     </article>
  `;
}

function sideList(list) {
return `    <div class="side-list">
      ${list.map(x =>` <a href="article.html?id=${x.id}"> <span>${x.section}</span> <b>${x.title}</b> </a>
`).join("")}     </div>
  `;
}

/* ================= HELPERS ================= */

function detectTopic(text) {
const s = cleanTopic(text);

const map = {
"new-york": ["new york", "nyc", "manhattan", "brooklyn"],
"politics": ["politics", "white house", "congress", "senate", "election", "trump"],
"business": ["business", "company", "economy", "bank", "finance"],
"stock-market": ["stock", "wall street", "nasdaq", "dow", "s&p"],
"bitcoin": ["bitcoin", "crypto", "btc", "ethereum"],
"artificial-intelligence": ["artificial intelligence", " ai ", "openai", "chatgpt"],
"weather": ["weather", "storm", "heat", "rain", "flood", "climate"],
"world": ["world", "global", "europe", "asia", "middle east", "war"],
"tech": ["technology", "tech", "cyber", "software"],
"sports": ["sports", "world cup", "soccer", "football"],
"health": ["health", "hospital", "doctor", "medical"],
"science": ["science", "space", "research"],
"arts": ["arts", "movie", "music", "book", "theater"],
"lifestyle": ["lifestyle", "travel", "style", "love", "food"],
"opinion": ["opinion", "editorial", "essay"],
"video": ["video", "watch"],
"audio": ["audio", "podcast", "listen"],
"games": ["game", "wordle", "sudoku", "crossword"],
"cooking": ["cooking", "recipe", "dinner", "breakfast"],
"wirecutter": ["wirecutter", "review", "best picks", "shopping"],
"california": ["california", "los angeles", "san francisco"],
"education": ["education", "school", "college", "student"],
"nfl": ["nfl"],
"nba": ["nba"],
"mlb": ["mlb"],
"formula-1": ["formula 1", "f1"],
"tennis": ["tennis"]
};

for (const [topic, words] of Object.entries(map)) {
if (words.some(w => s.includes(w))) return topic;
}

return "us";
}

function updateDate() {
const box = document.getElementById("todayDate");
if (!box) return;

box.textContent = new Intl.DateTimeFormat("en-US", {
weekday: "long",
month: "long",
day: "numeric",
year: "numeric"
}).format(new Date());
}

function updateTopTrend() {
const box = document.getElementById("topTrendBox");
if (!box) return;

const items = ["AAPL +1.24% ↑", "Nasdaq -0.43% ↓", "Dow +0.35% ↑", "BTC +2.18% ↑", "S&P 500 -0.11% ↓"];
let i = 0;

setInterval(() => {
box.textContent = items[i % items.length];
i++;
}, 3000);
}

function updateSEO() {
const topic = getParam("topic");
if (topic) {
document.title = `${titleCase(topic)} News | ${SITE_NAME}`;
}
}

function setHTML(id, html) {
const el = document.getElementById(id);
if (el) el.innerHTML = html;
}

function slugify(text) {
return String(text)
.toLowerCase()
.replace(/&/g, "and")
.replace(/[^a-z0-9]+/g, "-")
.replace(/(^-|-$)/g, "");
}

function cleanTopic(text) {
return String(text || "")
.toLowerCase()
.replace(/-/g, " ")
.replace(/\s+/g, " ")
.trim();
}

function titleCase(text) {
return String(text || "")
.replace(/-/g, " ")
.replace(/\b\w/g, c => c.toUpperCase());
}

function clean(text) {
return String(text || "").replace(/\s+/g, " ").trim();
}

function getParam(name) {
return new URLSearchParams(location.search).get(name);
}

function formatDate(date) {
return new Date(date).toLocaleDateString("en-US", {
month: "short",
day: "numeric",
year: "numeric"
});
}

function readingTime(text) {
return Math.max(1, Math.ceil(String(text || "").split(/\s+/).length / 220));
}

function paragraphs(text) {
const t = text || "This story is developing and will be updated.";
return t.split(". ").map(p => `<p>${p}${p.endsWith(".") ? "" : "."}</p>`).join("");
}

/* run article page after data loads */
document.addEventListener("DOMContentLoaded", () => {
setTimeout(renderArticlePage, 500);
});
function initTopMarketClick() {
  const box = document.getElementById("topTrendBox");
  if (!box) return;

  box.style.cursor = "pointer";
  box.title = "Open Market Dashboard";

  box.addEventListener("click", function () {
    window.location.href = "market.html";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initTopMarketClick();
});
