/* =========================================================
   GLOBAL INTEL TIMES — LIVE app.js v3
   Uses:
   /api/news
   /api/videos
   /api/weather
   /api/markets
   /api/crypto
   /api/sports
========================================================= */

"use strict";

/* ================= CONFIG ================= */

const SITE_NAME = "Global Intel Times";

const API = {
  news: "/api/news",
  videos: "/api/videos",
  weather: "/api/weather",
  markets: "/api/markets",
  crypto: "/api/crypto",
  sports: "/api/sports",
  search: "/api/search",
  analytics: "/api/analytics",
  trending: "/api/trending"
};

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200";

const REFRESH_MS = 5 * 60 * 1000;

/* ================= MEGA MENU DATA ================= */

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

/* ================= STATE ================= */

let allArticles = [];
let allVideos = [];
let weatherData = null;
let marketData = null;
let cryptoData = null;
let sportsScores = [];

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", async function () {
  updateDate();
  initMegaNavigation();
  initTopMarketClick();
  initSearchBoxes();

  await loadAllLiveData();
  renderEverything();

  setInterval(async function () {
    await loadAllLiveData();
    renderEverything();
  }, REFRESH_MS);
});

/* ================= LIVE DATA ================= */

async function loadAllLiveData() {
  const topic = getParam("topic") || "usa breaking news";

  const results = await Promise.allSettled([
    fetchNews(topic),
    fetchVideos(topic),
    fetchWeather("New York"),
    fetchMarket(getParam("symbol") || "AAPL"),
    fetchCrypto(getParam("coin") || "bitcoin"),
    fetchSports()
  ]);

  allArticles = results[0].status === "fulfilled" ? results[0].value : fallbackArticles();
  allVideos = results[1].status === "fulfilled" ? results[1].value : fallbackVideos();
  weatherData = results[2].status === "fulfilled" ? results[2].value : null;
  marketData = results[3].status === "fulfilled" ? results[3].value : null;
  cryptoData = results[4].status === "fulfilled" ? results[4].value : null;
  sportsScores = results[5].status === "fulfilled" ? results[5].value : [];

  if (!allArticles.length) allArticles = fallbackArticles();
  if (!allVideos.length) allVideos = fallbackVideos();

  allArticles = removeDuplicates(filterBadNews(allArticles));
}

async function fetchNews(topic) {
  const data = await getJSON(API.news + "?topic=" + encodeURIComponent(topic));
  const list = Array.isArray(data) ? data : data.articles || [];
  return normalizeArticles(list);
}

async function fetchVideos(topic) {
const data = await getJSON(API.videos + "?topic=" + encodeURIComponent(topic));
const list = Array.isArray(data) ? data : data.videos || [];
return list.map(function (v) {
return {
id: v.id || slugify(v.title),
title: v.title || "Video Update",
summary: v.summary || v.description || "Latest video update.",
thumbnail: v.thumbnail || v.image || DEFAULT_IMG,
url: v.url || "#",
embedUrl: v.embedUrl || "",
channel: v.channel || "Global Intel Times",
category: v.category || "video",
publishedAt: v.publishedAt || new Date().toISOString()
};
});
}

async function fetchWeather(city) {
const data = await getJSON(API.weather + "?city=" + encodeURIComponent(city));
return data.weather || data;
}

async function fetchMarket(symbol) {
const data = await getJSON(API.markets + "?symbol=" + encodeURIComponent(symbol));
return data.market || data;
}

async function fetchCrypto(coin) {
const data = await getJSON(API.crypto + "?coin=" + encodeURIComponent(coin));
return data.crypto || data;
}

async function fetchSports() {
const data = await getJSON(API.sports);
return data.scores || [];
}

async function getJSON(url) {
const res = await fetch(url, { cache: "no-store" });
if (!res.ok) throw new Error("API failed: " + url);
return await res.json();
}

/* ================= MAIN RENDER ================= */

function renderEverything() {
renderBreakingTicker();
renderHomeCards();
renderMoreNews();
renderVideos();
renderWeather();
renderTopMarket();
renderCrypto();
renderSports();
renderWell();
renderAudio();
renderCategoryPage();
renderArticlePage();
updateSEO();
}

/* ================= BREAKING TICKER ================= */

function renderBreakingTicker() {
const box = document.getElementById("breakingTicker");
if (!box) return;

const items = allArticles.slice(0, 8);

box.innerHTML = items
.map(function (x) {
return '<a href="article.html?id=' + x.id + '">' + escapeHTML(x.title) + "</a>";
})
.join("  •  ");
}

/* ================= HERO NEWS ================= */

function renderHomeCards() {
setHTML("leadLeft", smallCard(allArticles[1]));
setHTML("leadMain", bigCard(allArticles[0]));
setHTML("leadRight", sideList(allArticles.slice(2, 6)));
}

/* ================= MORE NEWS ================= */

function renderMoreNews() {
const box = document.getElementById("moreNewsGrid");
if (!box) return;

box.innerHTML = allArticles.slice(6, 42).map(card).join("");
}

/* ================= VIDEOS ================= */

function renderVideos() {
const grid = document.querySelector(".video-grid");
if (!grid) return;

const videos = allVideos.slice(0, 6);

grid.innerHTML = videos
.map(function (v) {
return (
'<div class="video-card">' +
'<a href="' + v.url + '" target="_blank" rel="noopener">' +
'<img src="' + v.thumbnail + '" alt="' + escapeHTML(v.title) + '" loading="lazy" onerror="this.src=\'' + DEFAULT_IMG + '\'">' +
'<div class="play-btn">▶</div>' +
'<h3>' + escapeHTML(v.title) + '</h3>' +
'</a>' +
'</div>'
);
})
.join("");
}

/* ================= WEATHER ================= */

function renderWeather() {
const box =
document.getElementById("weatherBox") ||
document.querySelector(".weather-box");

if (!box || !weatherData) return;

box.innerHTML =
'<div class="weather-card">' +
'<h3>' + escapeHTML(weatherData.city || "Weather") + '</h3>' +
'<strong>' + (weatherData.temp || "--") + "°</strong>" +
'<p>' + escapeHTML(weatherData.condition || weatherData.description || "Live weather") + '</p>' +
'<small>Humidity: ' + (weatherData.humidity || "--") + "% • Wind: " + (weatherData.wind || "--") + "</small>" +
"</div>";
}

/* ================= TOP MARKET ================= */

function renderTopMarket() {
const box = document.getElementById("topTrendBox");
if (!box || !marketData) return;

const change = Number(marketData.change || 0);
const arrow = change >= 0 ? "↑" : "↓";
const sign = change >= 0 ? "+" : "";

box.innerHTML =
(marketData.symbol || "AAPL") +
" " +
sign +
change +
"% " +
arrow;

box.style.cursor = "pointer";
box.title = "Open Market Dashboard";
}

/* ================= CRYPTO ================= */

function renderCrypto() {
const box =
document.getElementById("cryptoBox") ||
document.querySelector(".crypto-box");

if (!box || !cryptoData) return;

box.innerHTML =
'<div class="crypto-card">' +
'<h3>' + escapeHTML(cryptoData.name || "Bitcoin") + '</h3>' +
'<strong>$' + formatNumber(cryptoData.price || 0) + '</strong>' +
'<p>' + escapeHTML(cryptoData.sentiment || "Live crypto update") + '</p>' +
'</div>';
}

/* ================= SPORTS ================= */

function renderSports() {
const strip = document.querySelector(".score-strip");
if (!strip) return;

const scores = sportsScores.length ? sportsScores.slice(0, 8) : fallbackScores();

strip.innerHTML = scores
.map(function (s) {
return (
'<div>' +
'<b>' + escapeHTML(s.league || s.status || "Live") + '</b>' +
'<span>' +
escapeHTML(s.homeTeam || "Home") +
" " +
safeScore(s.homeScore) +
" — " +
safeScore(s.awayScore) +
" " +
escapeHTML(s.awayTeam || "Away") +
'</span>' +
'</div>'
);
})
.join("");
}

function safeScore(v) {
if (v === null || v === undefined) return "0";
return String(v);
}
/* ================= WELL ================= */

function renderWell() {

  const box = document.querySelector(".well-grid");

  if (!box) return;

  const items = allArticles
    .filter(a =>
      ["health","science","lifestyle","food"].includes(
        (a.topic || a.category || "").toLowerCase()
      )
    )
    .slice(0,8);

  box.innerHTML = items.map(card).join("");

}

/* ================= AUDIO ================= */

function renderAudio() {

  const box = document.querySelector(".audio-grid");

  if (!box) return;

  const podcasts = [

    {
      title:"The Daily Briefing",
      desc:"Today's biggest headlines in 10 minutes."
    },

    {
      title:"Markets Daily",
      desc:"Wall Street, Nasdaq, Dow and crypto."
    },

    {
      title:"Technology Today",
      desc:"AI, OpenAI, Microsoft, Google and startups."
    },

    {
      title:"Politics Weekly",
      desc:"White House, Congress and elections."
    }

  ];

  box.innerHTML = podcasts.map(function(p){

    return `
      <article class="audio-card">

        <h3>${p.title}</h3>

        <p>${p.desc}</p>

        <button>▶ Listen</button>

      </article>
    `;

  }).join("");

}

/* ================= CATEGORY PAGE ================= */

function renderCategoryPage(){

  const root=document.getElementById("categoryArticles");

  if(!root) return;

  const topic=(getParam("topic")||"us").toLowerCase();

  const list=filterCategory(topic);

  const title=document.getElementById("categoryTitle");

  if(title){

    title.textContent=titleCase(topic);

  }

  root.innerHTML=list.map(card).join("");

}

function filterCategory(topic){

  topic=topic.replace(/-/g," ");

  return allArticles.filter(function(article){

    const text=(

      (article.topic||"")+

      " "+

      (article.category||"")+

      " "+

      (article.title||"")+

      " "+

      (article.summary||"")

    ).toLowerCase();

    return text.includes(topic);

  });

}

/* ================= ARTICLE PAGE ================= */

function renderArticlePage(){

  const root=document.getElementById("articleRoot");

  if(!root) return;

  const id=getParam("id");

  const article=

    allArticles.find(a=>a.id===id)

    ||

    allArticles[0];

  if(!article) return;

  root.innerHTML=`

  <article class="article-page">

      <p class="breadcrumb">

      <a href="index.html">Home</a>

      /

      ${article.section}

      </p>

      <h1>${article.title}</h1>

      <p class="summary">

      ${article.summary}

      </p>

      <img

      src="${article.image}"

      loading="lazy"

      onerror="this.src='${DEFAULT_IMG}'"

      >

      <div class="article-meta">

      ${formatDate(article.publishedAt)}

      ·

      ${readingTime(article.content)} min read

      </div>

      <div class="article-content">

      ${paragraphs(article.content)}

      </div>

  </article>

  `;

}
/* ================= CARD COMPONENTS ================= */

function card(article){

  if(!article) return "";

  return `

  <article class="news-card">

      <a href="article.html?id=${article.id}">

          <img

            src="${article.image}"

            loading="lazy"

            onerror="this.src='${DEFAULT_IMG}'"

            alt="${escapeHTML(article.title)}"

          >

          <span class="news-category">

            ${article.section}

          </span>

          <h3>

            ${escapeHTML(article.title)}

          </h3>

          <p>

            ${escapeHTML(article.summary)}

          </p>

      </a>

  </article>

  `;

}

function bigCard(article){

  if(!article) return "";

  return `

  <article class="hero-card">

      <a href="article.html?id=${article.id}">

          <img

            src="${article.image}"

            loading="lazy"

            onerror="this.src='${DEFAULT_IMG}'"

          >

          <div class="hero-content">

              <span>

                ${article.section}

              </span>

              <h2>

                ${escapeHTML(article.title)}

              </h2>

              <p>

                ${escapeHTML(article.summary)}

              </p>

          </div>

      </a>

  </article>

  `;

}

function smallCard(article){

  if(!article) return "";

  return `

  <article class="small-card">

      <a href="article.html?id=${article.id}">

          <span>

            ${article.section}

          </span>

          <h3>

            ${escapeHTML(article.title)}

          </h3>

          <p>

            ${escapeHTML(article.summary)}

          </p>

      </a>

  </article>

  `;

}

function sideList(items){

  return `

    <div class="side-news">

    ${items.map(function(item){

      return `

      <a href="article.html?id=${item.id}">

          <span>

            ${item.section}

          </span>

          <b>

            ${escapeHTML(item.title)}

          </b>

      </a>

      `;

    }).join("")}

    </div>

  `;

}

/* ================= SIDEBAR ================= */

function renderSidebar(){

  renderTrending();

  renderMostRead();

  renderNewsletter();

  renderVisitorCounter();

}

function renderTrending(){

  const box=document.getElementById("trendingStories");

  if(!box) return;

  box.innerHTML=

    allArticles

    .slice(0,8)

    .map(function(a){

      return `

      <a href="article.html?id=${a.id}">

      ${escapeHTML(a.title)}

      </a>

      `;

    })

    .join("");

}

function renderMostRead(){

  const box=document.getElementById("mostRead");

  if(!box) return;

  box.innerHTML=

    allArticles

    .slice(5,15)

    .map(function(a){

      return `

      <a href="article.html?id=${a.id}">

      ${escapeHTML(a.title)}

      </a>

      `;

    })

    .join("");

}

function renderNewsletter(){

  const box=document.getElementById("newsletterBox");

  if(!box) return;

  box.innerHTML=`

  <div class="newsletter-card">

      <h3>

      Daily Newsletter

      </h3>

      <p>

      Get breaking news every morning.

      </p>

      <input

      type="email"

      placeholder="Email address"

      >

      <button>

      Subscribe

      </button>

  </div>

  `;

}

function renderVisitorCounter(){

  const box=document.getElementById("visitorCounter");

  if(!box) return;

  const visitors=

  125000+

  Math.floor(Math.random()*5000);

  box.innerHTML=

  "<strong>"+

  visitors.toLocaleString()

  +

  "</strong> Visitors Today";

}
/* ================= SEARCH SYSTEM ================= */

function initSearchBoxes(){

  const boxes=document.querySelectorAll(
    "#siteSearch, .site-search, [data-site-search]"
  );

  boxes.forEach(function(input){

    input.addEventListener("input",function(){

      showSearchSuggestions(input);

    });

    input.addEventListener("keydown",function(e){

      if(e.key==="Enter"){

        const q=input.value.trim();

        if(q){

          window.location.href=
          "search.html?q="+encodeURIComponent(q);

        }

      }

    });

  });

}

async function showSearchSuggestions(input){

  let box=document.getElementById("searchSuggestions");

  if(!box) return;

  const q=input.value.trim();

  if(!q){

    box.innerHTML="";

    return;

  }

  const results=allArticles.filter(function(a){

    return (

      a.title+

      " "+

      a.summary+

      " "+

      a.category

    ).toLowerCase().includes(q.toLowerCase());

  }).slice(0,6);

  box.innerHTML=results.map(function(a){

    return `

      <a href="article.html?id=${a.id}">

      ${escapeHTML(a.title)}

      </a>

    `;

  }).join("");

}

function renderSearchPage(){

  const root=document.getElementById("searchResults");

  if(!root) return;

  const q=getParam("q")||"";

  const results=allArticles.filter(function(a){

    const text=

    (

      a.title+

      " "+

      a.summary+

      " "+

      a.category+

      " "+

      a.section

    ).toLowerCase();

    return text.includes(q.toLowerCase());

  });

  root.innerHTML=

  "<h1>Search: "+escapeHTML(q)+"</h1>"+

  '<div class="article-grid">'+

  results.map(card).join("")+

  "</div>";

}

/* ================= INFINITE SCROLL ================= */

let infinitePage=1;

function initInfiniteScroll(){

  window.addEventListener("scroll",function(){

    const nearBottom=

    window.innerHeight+

    window.scrollY

    >=

    document.body.offsetHeight-700;

    if(nearBottom){

      loadMoreNews();

    }

  });

}

function loadMoreNews(){

  const box=document.getElementById("infiniteNews");

  if(!box) return;

  const start=infinitePage*12;

  const more=allArticles.slice(start,start+12);

  if(!more.length) return;

  box.insertAdjacentHTML(

    "beforeend",

    more.map(card).join("")

  );

  infinitePage++;

}

/* ================= MARKET CLICK ================= */

function initTopMarketClick(){

  const box=document.getElementById("topTrendBox");

  if(!box) return;

  box.style.cursor="pointer";

  box.title="Open Market Dashboard";

  box.addEventListener("click",function(){

    window.location.href="market.html";

  });

}

/* ================= MARKET PAGE ================= */

function renderMarketPage(){

  const root=document.getElementById("marketRoot");

  if(!root) return;

  const symbol=getParam("symbol")||"AAPL";

  root.innerHTML=`

  <section class="market-dashboard">

    <h1>Market Dashboard</h1>

    <div class="market-search-box">

      <input

      id="marketSearch"

      value="${symbol}"

      placeholder="AAPL, MSFT, NVDA, BTC, ETH"

      >

      <button id="marketSearchBtn">

      Search

      </button>

    </div>

    <div id="tradingViewBox" class="tradingview-box"></div>

    <div id="marketAnalysisBox"></div>

  </section>

  `;

  updateTradingView(symbol);

  renderMarketAnalysis();

  const btn=document.getElementById("marketSearchBtn");

  const input=document.getElementById("marketSearch");

  if(btn&&input){

    btn.addEventListener("click",function(){

      const s=input.value.trim().toUpperCase();

      window.location.href="market.html?symbol="+encodeURIComponent(s);

    });

  }

}

function updateTradingView(symbol){

  const box=document.getElementById("tradingViewBox");

  if(!box) return;

  const tv=normalizeMarketSymbol(symbol);

  box.innerHTML=

  '<iframe '+

  'title="TradingView Chart" '+

  'src="https://s.tradingview.com/widgetembed/?symbol='+tv+'&interval=D&theme=light&style=1&timezone=America%2FNew_York" '+

  'width="100%" '+

  'height="520" '+

  'frameborder="0" '+

  'allowtransparency="true" '+

  'scrolling="no">'+

  '</iframe>';

}

function renderMarketAnalysis(){

  const box=document.getElementById("marketAnalysisBox");

  if(!box||!marketData) return;

  box.innerHTML=`

  <div class="market-analysis-grid">

    <div>

      <h3>AI Analysis</h3>

      <p>${escapeHTML(marketData.aiAnalysis||"Market momentum is being watched.")}</p>

    </div>

    <div>

      <h3>Support</h3>

      <p>${marketData.support||"--"}</p>

    </div>

    <div>

      <h3>Resistance</h3>

      <p>${marketData.resistance||"--"}</p>

    </div>

    <div>

      <h3>Trend</h3>

      <p>${escapeHTML(marketData.trend||"Neutral")}</p>

    </div>

    <div>

      <h3>Sentiment</h3>

      <p>${escapeHTML(marketData.sentiment||"Mixed")}</p>

    </div>

  </div>

  `;

}

function normalizeMarketSymbol(symbol){

  const s=String(symbol||"AAPL").toUpperCase();

  const map={

    BTC:"BINANCE:BTCUSDT",

    ETH:"BINANCE:ETHUSDT",

    GOLD:"TVC:GOLD",

    SILVER:"TVC:SILVER",

    AAPL:"NASDAQ:AAPL",

    MSFT:"NASDAQ:MSFT",

    NVDA:"NASDAQ:NVDA",

    TSLA:"NASDAQ:TSLA",

    META:"NASDAQ:META",

    GOOGL:"NASDAQ:GOOGL"

  };

  return map[s]||"NASDAQ:"+s;

}

/* ================= SEO ================= */

function updateSEO(){

  const topic=getParam("topic");

  if(topic){

    document.title=

    titleCase(topic)+

    " News | "+

    SITE_NAME;

  }

  const articleId=getParam("id");

  if(articleId){

    const article=allArticles.find(function(a){

      return a.id===articleId;

    });

    if(article){

      document.title=

      article.title+

      " | "+

      SITE_NAME;

      setMeta("description",article.summary);

      setMeta("og:title",article.title);

      setMeta("og:description",article.summary);

      setMeta("twitter:title",article.title);

      setMeta("twitter:description",article.summary);

    }

  }

}

function setMeta(name,content){

  let tag=

  document.querySelector('meta[name="'+name+'"]')||

  document.querySelector('meta[property="'+name+'"]');

  if(!tag){

    tag=document.createElement("meta");

    if(name.startsWith("og:")){

      tag.setAttribute("property",name);

    }else{

      tag.setAttribute("name",name);

    }

    document.head.appendChild(tag);

  }

  tag.setAttribute("content",content||"");

}

/* ================= HELPERS PART 1 ================= */

function normalizeArticles(items){

  return items.map(function(item,index){

    const title=clean(

      item.title||

      "News Update "+(index+1)

    );

    const text=

    title+

    " "+

    (item.description||"")+

    " "+

    (item.summary||"");

    const topic=detectTopic(text);

    return {

      id:slugify(item.id||title),

      topic:topic,

      category:item.category||topic,

      section:item.section||titleCase(topic),

      title:title,

      summary:clean(

        item.description||

        item.summary||

        item.content||

        "Latest update from Global Intel Times."

      ),

      content:clean(

        item.content||

        item.description||

        item.summary||

        "This story is developing."

      ),

      author:item.author||"Global Intel Desk",

      image:item.image||item.urlToImage||item.thumbnail||DEFAULT_IMG,

      publishedAt:item.publishedAt||new Date().toISOString(),

      source:item.sourceUrl||item.url||item.source||"#"

    };

  });

}

function filterBadNews(list){

  const bad=[

    "casino",

    "betting",

    "odds",

    "coupon",

    "promo",

    "sponsored",

    "adult",

    "gambling"

  ];

  return list.filter(function(x){

    const text=(x.title+" "+x.summary).toLowerCase();

    return !bad.some(function(w){

      return text.includes(w);

    });

  });

}

/* ================= HELPERS PART 2 ================= */

function removeDuplicates(list) {
  const seen = new Set();

  return list.filter(function (item) {
    const key = slugify(item.title || "").slice(0, 90);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fallbackArticles() {
  return [
    fallbackArticle("us", "U.S. Officials Monitor Breaking Developments Across Major Cities"),
    fallbackArticle("politics", "White House Faces Pressure as Congress Debates New Spending Plan"),
    fallbackArticle("markets", "Wall Street Watches Technology Shares as Market Momentum Shifts"),
    fallbackArticle("bitcoin", "Bitcoin Traders Watch Key Levels After Crypto Market Volatility"),
    fallbackArticle("artificial-intelligence", "AI Companies Prepare for New Compliance Rules"),
    fallbackArticle("weather", "Extreme Weather Alerts Expand Across Major U.S. Regions"),
    fallbackArticle("world", "Global Leaders Weigh Diplomacy as Regional Tensions Continue"),
    fallbackArticle("technology", "Cybersecurity Experts Warn Companies About Rising Online Threats"),
    fallbackArticle("sports", "Sports Fans Track Live Scores Across Major U.S. Leagues"),
    fallbackArticle("health", "Health Systems Expand Digital Tools to Improve Patient Care"),
    fallbackArticle("science", "Scientists Track New Climate Signals Across the Atlantic"),
    fallbackArticle("culture", "Culture Weekend Brings New Movies, Music and Theater Openings")
  ];
}

function fallbackArticle(category, title) {
  return {
    id: slugify(title),
    topic: category,
    category: category,
    section: titleCase(category),
    title: title,
    summary: "Fallback story shown only when live APIs are unavailable.",
    content: "This story is developing and will be updated with live information.",
    image: DEFAULT_IMG,
    publishedAt: new Date().toISOString(),
    source: "#"
  };
}

function fallbackVideos() {
  return [
    {
      id: "video-briefing",
      title: "Breaking News Video Briefing",
      summary: "Latest visual update from Global Intel Times.",
      thumbnail: DEFAULT_IMG,
      url: "#",
      category: "video"
    }
  ];
}

function fallbackScores() {
  return [
    { league: "World Cup", homeTeam: "United States", awayTeam: "Turkey", homeScore: 1, awayScore: 1, status: "Live" },
    { league: "NBA", homeTeam: "Lakers", awayTeam: "Warriors", homeScore: 102, awayScore: 98, status: "Final" },
    { league: "NFL", homeTeam: "Cowboys", awayTeam: "Eagles", homeScore: 21, awayScore: 24, status: "Final" }
  ];
}

/* ================= TOPIC DETECTION ================= */

function detectTopic(text) {
  const s = cleanTopic(text);

  const map = {
    "new-york": ["new york", "nyc", "manhattan", "brooklyn"],
    politics: ["politics", "white house", "congress", "senate", "election", "trump"],
    business: ["business", "company", "economy", "bank", "finance"],
    markets: ["stock", "market", "wall street", "nasdaq", "dow", "s&p"],
    bitcoin: ["bitcoin", "crypto", "btc", "ethereum"],
    "artificial-intelligence": ["artificial intelligence", "openai", "chatgpt", " ai "],
    weather: ["weather", "storm", "heat", "rain", "flood", "climate"],
    world: ["world", "global", "europe", "asia", "middle east", "war"],
    technology: ["technology", "tech", "cyber", "software"],
    sports: ["sports", "world cup", "soccer", "football", "nba", "nfl", "mlb"],
    health: ["health", "hospital", "doctor", "medical"],
    science: ["science", "space", "research", "nasa"],
    culture: ["culture", "movie", "music", "book", "theater"],
    lifestyle: ["lifestyle", "travel", "style", "love", "food"],
    opinion: ["opinion", "editorial", "essay"],
    video: ["video", "watch"],
    audio: ["audio", "podcast", "listen"],
    games: ["game", "wordle", "sudoku", "crossword"],
    cooking: ["cooking", "recipe", "dinner", "breakfast"],
    wirecutter: ["wirecutter", "review", "best picks", "shopping"]
  };

  for (const topic in map) {
    if (map[topic].some(function (word) { return s.includes(word); })) {
      return topic;
    }
  }

  return "us";
}

/* ================= BASIC UTILITIES ================= */

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(text) {
  return String(text || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function clean(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function cleanTopic(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html || "";
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString("en-US");
}

function formatDate(date) {
  return new Date(date || Date.now()).toLocaleDateString("en-US", {
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
  return t
    .split(". ")
    .filter(Boolean)
    .map(function (p) {
      return "<p>" + escapeHTML(p) + (p.endsWith(".") ? "" : ".") + "</p>";
    })
    .join("");
}

/* ================= DATE ================= */

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

/* ================= MEGA MENU ================= */

function initMegaNavigation() {
  const nav = document.getElementById("megaNav");
  const wrap = document.getElementById("megaMenuWrap");
  if (!nav || !wrap) return;

  nav.innerHTML = Object.keys(TOP_MENU).map(function (name) {
    return (
      '<a class="mega-nav-link" href="category.html?topic=' +
      slugify(name) +
      '" data-menu="' +
      name +
      '">' +
      name +
      " <span>⌄</span></a>"
    );
  }).join("");

  nav.querySelectorAll("[data-menu]").forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      openMegaPanel(link.dataset.menu);
    });

    link.addEventListener("click", function (e) {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      openMegaPanel(link.dataset.menu);
    });
  });

  wrap.addEventListener("mouseenter", function () {
    wrap.classList.add("active");
  });

  wrap.addEventListener("mouseleave", closeMegaPanel);

  document.addEventListener("click", function (e) {
    if (!nav.contains(e.target) && !wrap.contains(e.target)) {
      closeMegaPanel();
    }
  });
}

function openMegaPanel(menuName) {
  const wrap = document.getElementById("megaMenuWrap");
  const menu = TOP_MENU[menuName];
  if (!wrap || !menu) return;

  let html = "";
  html += '<div class="nyt-panel">';
  html += '<div class="nyt-panel-title">';
  html += "<h2>" + escapeHTML(menuName) + "</h2>";
  html += "<p>" + escapeHTML(menu.desc) + "</p>";
  html += "</div>";

  menu.cols.forEach(function (col) {
    html += '<div class="nyt-panel-col">';
    html += "<h4>" + escapeHTML(col[0]) + "</h4>";

    for (let i = 1; i < col.length; i++) {
      html +=
        '<a href="category.html?topic=' +
        slugify(col[i]) +
        '">' +
        escapeHTML(col[i]) +
        "</a>";
    }

    html += "</div>";
  });

  html += "</div>";

  wrap.innerHTML = html;
  wrap.classList.add("active");
}

function closeMegaPanel() {
  const wrap = document.getElementById("megaMenuWrap");
  if (wrap) wrap.classList.remove("active");
}

/* ================= START EXTRA FEATURES ================= */

document.addEventListener("DOMContentLoaded", function () {
  initInfiniteScroll();
  renderSearchPage();
  renderMarketPage();
  renderSidebar();
});
/* ================= PART 6 — EXTRA HOMEPAGE SECTIONS ================= */

function renderExtraSections() {
  renderTopicSection("politicsSection", "politics", "Politics");
  renderTopicSection("worldSection", "world", "World");
  renderTopicSection("businessSection", "business", "Business");
  renderTopicSection("marketsSection", "markets", "Markets");
  renderTopicSection("technologySection", "technology", "Technology");
  renderTopicSection("aiSection", "artificial-intelligence", "Artificial Intelligence");
  renderTopicSection("newYorkSection", "new-york", "New York");
  renderTopicSection("healthSection", "health", "Health");
  renderTopicSection("scienceSection", "science", "Science");
  renderTopicSection("cultureSection", "culture", "Culture");
  renderTopicSection("opinionSection", "opinion", "Opinion");
}

function renderTopicSection(id, topic, heading) {
  const box = document.getElementById(id);
  if (!box) return;

  const articles = allArticles
    .filter(function (a) {
      const text = cleanTopic(
        (a.topic || "") + " " +
        (a.category || "") + " " +
        (a.section || "") + " " +
        (a.title || "") + " " +
        (a.summary || "")
      );

      return text.includes(cleanTopic(topic));
    })
    .slice(0, 6);

  box.innerHTML =
    '<section class="editorial-section">' +
    '<div class="section-kicker">' + heading + '</div>' +
    '<div class="article-grid">' +
    (articles.length ? articles.map(card).join("") : "<p>No " + heading + " updates right now.</p>") +
    '</div>' +
    '</section>';
}

/* ================= PART 6 — LATEST UPDATES ================= */

function renderLatestUpdates() {
  const box = document.getElementById("latestUpdates");
  if (!box) return;

  box.innerHTML = allArticles.slice(0, 12).map(function (a) {
    return (
      '<div class="latest-item">' +
      '<span>' + formatDate(a.publishedAt) + '</span>' +
      '<a href="article.html?id=' + a.id + '">' + escapeHTML(a.title) + '</a>' +
      '</div>'
    );
  }).join("");
}

/* ================= PART 6 — TRENDING ANALYTICS ================= */

function renderAnalyticsPanel() {
  const box = document.getElementById("analyticsPanel");
  if (!box) return;

  const data = [
    ["Trending Score", 92],
    ["AI Score", 88],
    ["Market Score", 84],
    ["Crypto Score", 79],
    ["Politics Score", 86],
    ["Technology Score", 89],
    ["Weather Score", 81],
    ["Sports Score", 76]
  ];

  box.innerHTML = data.map(function (item) {
    return (
      '<div class="score-row">' +
      '<span>' + item[0] + '</span>' +
      '<strong>' + item[1] + '</strong>' +
      '</div>'
    );
  }).join("");
}

/* ================= PART 6 — ADS ================= */

function renderAds() {
  document.querySelectorAll("[data-ad]").forEach(function (ad) {
    ad.innerHTML = "Advertisement";
    ad.classList.add("ad-box");
  });
}

/* ================= PART 6 — FOOTER ================= */

function renderFooterDynamic() {
  const footer = document.getElementById("dynamicFooter");
  if (!footer) return;

  footer.innerHTML =
    '<div class="footer-logo">Global Intel Times</div>' +
    '<div class="footer-links">' +
    '<a href="index.html">Home</a>' +
    '<a href="category.html?topic=politics">Politics</a>' +
    '<a href="category.html?topic=markets">Markets</a>' +
    '<a href="category.html?topic=technology">Technology</a>' +
    '<a href="category.html?topic=sports">Sports</a>' +
    '<a href="category.html?topic=weather">Weather</a>' +
    '</div>' +
    '<p>© 2026 Global Intel Times. All Rights Reserved.</p>';
}

/* ================= PART 6 — CONNECT EXTRA RENDER ================= */

const oldRenderEverything = renderEverything;

renderEverything = function () {
  oldRenderEverything();

  renderExtraSections();
  renderLatestUpdates();
  renderAnalyticsPanel();
  renderAds();
  renderFooterDynamic();
};
/* =========================================================
   PART 7 — STRICT CATEGORY ENGINE V4
========================================================= */

/* ================= STRICT CATEGORY MAP ================= */

const CATEGORY_RULES = {

  "us": [
    "usa","america","american","white house","congress",
    "washington","texas","florida","california"
  ],

  "new-york":[
    "new york","nyc","manhattan","brooklyn",
    "queens","bronx","staten island"
  ],

  "politics":[
    "politics","president","trump","biden",
    "white house","senate","congress",
    "election","supreme court"
  ],

  "world":[
    "world","china","russia","ukraine",
    "india","europe","middle east",
    "africa","asia","canada"
  ],

  "business":[
    "business","economy","company",
    "finance","bank","inflation",
    "jobs","startup"
  ],

  "markets":[
    "market","nasdaq","dow",
    "s&p","wall street","stock",
    "shares","earnings"
  ],

  "technology":[
    "technology","software","apple",
    "google","microsoft","meta",
    "amazon","tesla"
  ],

  "artificial-intelligence":[
    "artificial intelligence",
    "ai",
    "chatgpt",
    "openai",
    "gemini",
    "claude"
  ],

  "bitcoin":[
    "bitcoin",
    "btc",
    "ethereum",
    "crypto",
    "blockchain"
  ],

  "weather":[
    "weather",
    "storm",
    "rain",
    "heat",
    "snow",
    "hurricane",
    "flood"
  ],

  "sports":[
    "sports",
    "nba",
    "nfl",
    "mlb",
    "tennis",
    "formula 1",
    "world cup",
    "soccer"
  ],

  "health":[
    "health",
    "doctor",
    "hospital",
    "medical",
    "medicine"
  ],

  "science":[
    "science",
    "space",
    "research",
    "nasa"
  ],

  "culture":[
    "culture",
    "movie",
    "music",
    "book",
    "museum",
    "theatre"
  ],

  "lifestyle":[
    "travel",
    "food",
    "style",
    "fashion",
    "home"
  ]

};

/* ================= STRICT FILTER ================= */

function getCategoryArticles(topic){

    topic=(topic||"us").toLowerCase();

    const words=CATEGORY_RULES[topic]||[topic];

    return allArticles.filter(function(article){

        const text=(

            article.title+" "+

            article.summary+" "+

            article.category+" "+

            article.topic+" "+

            article.section

        ).toLowerCase();

        return words.some(function(word){

            return text.includes(word);

        });

    });

}

/* ================= CATEGORY PAGE ================= */

function renderStrictCategoryPage(){

    const root=document.getElementById("categoryArticles");

    if(!root) return;

    const topic=getParam("topic")||"us";

    const articles=getCategoryArticles(topic);

    const title=document.getElementById("categoryTitle");

    if(title){

        title.textContent=titleCase(topic);

    }

    root.innerHTML=

    '<div class="category-grid">'+

    articles.map(card).join("")+

    '</div>';

}

/* ================= RELATED STORIES ================= */

function renderRelatedStories(){

    const box=document.getElementById("relatedStories");

    if(!box) return;

    const id=getParam("id");

    const article=allArticles.find(a=>a.id===id);

    if(!article) return;

    const related=

    getCategoryArticles(article.topic)

    .filter(a=>a.id!==article.id)

    .slice(0,6);

    box.innerHTML=

    related.map(card).join("");

}

/* ================= TRENDING RIGHT SIDEBAR ================= */

function renderTrendingSidebar(){

    const box=document.getElementById("sidebarTrending");

    if(!box) return;

    box.innerHTML=

    allArticles

    .slice(0,10)

    .map(function(a){

        return

        '<a href="article.html?id='+a.id+'">'+

        escapeHTML(a.title)+

        '</a>';

    }).join("");

}

/* ================= AUTO REFRESH ================= */

setInterval(function(){

    loadAllLiveData()

    .then(function(){

        renderEverything();

        renderStrictCategoryPage();

        renderRelatedStories();

        renderTrendingSidebar();

    });

},300000);

/* ================= END PART 7 ================= */
/* =========================================================
   PART 8 — LIVE UI ENGINES
========================================================= */

/* ================= LIVE BREAKING BAR ================= */

function renderLiveBreakingBar() {
  const box = document.getElementById("liveBreakingBar");
  if (!box) return;

  const top = allArticles.slice(0, 10);

  box.innerHTML =
    '<strong>LIVE</strong>' +
    top.map(function (a) {
      return '<a href="article.html?id=' + a.id + '">' + escapeHTML(a.title) + '</a>';
    }).join("");
}

/* ================= LIVE MARKET TICKER ================= */

function renderLiveMarketTicker() {
  const box = document.getElementById("marketTicker");
  if (!box) return;

  const watch = ["AAPL", "MSFT", "NVDA", "TSLA", "META", "GOOGL", "BTC", "ETH", "GOLD"];

  box.innerHTML = watch.map(function (s) {
    return '<a href="market.html?symbol=' + s + '">' + s + ' <span>LIVE</span></a>';
  }).join("");
}

/* ================= STOCK HEAT MAP ================= */

function renderStockHeatMap() {
  const box = document.getElementById("stockHeatMap");
  if (!box) return;

  const stocks = ["AAPL", "MSFT", "NVDA", "TSLA", "META", "GOOGL", "AMZN", "NFLX"];

  box.innerHTML = stocks.map(function (s, i) {
    const score = 60 + ((i * 7) % 35);

    return (
      '<a class="heat-cell" href="market.html?symbol=' + s + '">' +
      '<strong>' + s + '</strong>' +
      '<span>' + score + '</span>' +
      '</a>'
    );
  }).join("");
}

/* ================= CRYPTO HEAT MAP ================= */

function renderCryptoHeatMap() {
  const box = document.getElementById("cryptoHeatMap");
  if (!box) return;

  const coins = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];

  box.innerHTML = coins.map(function (c, i) {
    const score = 55 + ((i * 9) % 40);

    return (
      '<a class="heat-cell" href="market.html?symbol=' + c + '">' +
      '<strong>' + c + '</strong>' +
      '<span>' + score + '</span>' +
      '</a>'
    );
  }).join("");
}

/* ================= WEATHER STRIP ================= */

function renderWeatherStrip() {
  const box = document.getElementById("weatherStrip");
  if (!box) return;

  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Miami"];

  box.innerHTML = cities.map(function (city) {
    return (
      '<a href="category.html?topic=weather">' +
      '<strong>' + city + '</strong>' +
      '<span>Live forecast</span>' +
      '</a>'
    );
  }).join("");
}

/* ================= LIVE SPORTS STRIP ================= */

function renderLiveSportsStrip() {
  const box = document.getElementById("liveSportsStrip");
  if (!box) return;

  const scores = sportsScores.length ? sportsScores.slice(0, 8) : fallbackScores();

  box.innerHTML = scores.map(function (s) {
    return (
      '<a href="category.html?topic=sports">' +
      '<strong>' + escapeHTML(s.league || "Sports") + '</strong>' +
      '<span>' +
      escapeHTML(s.homeTeam || "Home") +
      ' ' +
      safeScore(s.homeScore) +
      ' — ' +
      safeScore(s.awayScore) +
      ' ' +
      escapeHTML(s.awayTeam || "Away") +
      '</span>' +
      '</a>'
    );
  }).join("");
}

/* ================= AI TRENDING ENGINE ================= */

function renderAITrendingEngine() {
  const box = document.getElementById("aiTrendingEngine");
  if (!box) return;

  const topics = [
    ["Breaking", 96],
    ["Politics", 91],
    ["Markets", 88],
    ["AI", 94],
    ["Weather", 82],
    ["Sports", 76],
    ["Crypto", 79]
  ];

  box.innerHTML = topics.map(function (t) {
    return (
      '<div class="ai-trend-row">' +
      '<span>' + t[0] + '</span>' +
      '<strong>' + t[1] + '</strong>' +
      '</div>'
    );
  }).join("");
}

/* ================= VISITOR ANALYTICS ================= */

function renderVisitorAnalytics() {
  const box = document.getElementById("visitorAnalytics");
  if (!box) return;

  const live = 1000 + Math.floor(Math.random() * 900);
  const today = 125000 + Math.floor(Math.random() * 6000);

  box.innerHTML =
    '<div class="visitor-card">' +
    '<h3>Live Audience</h3>' +
    '<strong>' + live.toLocaleString() + '</strong>' +
    '<p>' + today.toLocaleString() + ' visitors today</p>' +
    '</div>';
}

/* ================= HOMEPAGE LAYOUT ENGINE ================= */

function renderAdvancedHomepageLayout() {
  renderTopicSection("topStoriesSection", "us", "Top Stories");
  renderTopicSection("extremeWeatherSection", "weather", "Extreme Weather");
  renderTopicSection("economySection", "business", "Economy");
  renderTopicSection("videoSectionDynamic", "video", "Video");
  renderTopicSection("latestNewsSection", "us", "Latest Updates");
}

/* ================= CONNECT PART 8 ================= */

const oldRenderEverythingPart8 = renderEverything;

renderEverything = function () {
  oldRenderEverythingPart8();

  renderLiveBreakingBar();
  renderLiveMarketTicker();
  renderStockHeatMap();
  renderCryptoHeatMap();
  renderWeatherStrip();
  renderLiveSportsStrip();
  renderAITrendingEngine();
  renderVisitorAnalytics();
  renderAdvancedHomepageLayout();
};

/* ================= END PART 8 ================= */
/* =========================================================
   PART 9 — UI FEATURES: DARK MODE, SHARE, BOOKMARK, PROGRESS
========================================================= */

function initDarkMode() {
  const btn = document.getElementById("themeToggle");
  const saved = localStorage.getItem("git-theme");

  if (saved === "dark") document.body.classList.add("dark");

  if (!btn) return;

  btn.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "git-theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });
}

function initReadingProgress() {
  let bar = document.getElementById("readingProgress");

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "readingProgress";
    document.body.appendChild(bar);
  }

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + "%";
  });
}

function initScrollTopButton() {
  let btn = document.getElementById("scrollTopBtn");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "scrollTopBtn";
    btn.innerHTML = "↑";
    document.body.appendChild(btn);
  }

  window.addEventListener("scroll", function () {
    btn.classList.toggle("show", window.scrollY > 600);
  });

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initShareButtons() {
  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const type = btn.getAttribute("data-share");
      shareCurrentPage(type);
    });
  });
}

function shareCurrentPage(type) {
  const url = window.location.href;
  const title = document.title;

  if (type === "copy") {
    navigator.clipboard.writeText(url);
    alert("Link copied");
  }

  if (type === "whatsapp") {
    window.open("https://wa.me/?text=" + encodeURIComponent(title + " " + url));
  }

  if (type === "facebook") {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url));
  }

  if (type === "twitter") {
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url));
  }
}

function saveBookmark(articleId) {
  const saved = JSON.parse(localStorage.getItem("git-bookmarks") || "[]");

  if (!saved.includes(articleId)) {
    saved.push(articleId);
  }

  localStorage.setItem("git-bookmarks", JSON.stringify(saved));
  alert("Article saved");
}

function renderBookmarkButtons() {
  document.querySelectorAll(".news-card, .hero-card").forEach(function (cardEl) {
    if (cardEl.querySelector(".bookmark-btn")) return;

    const link = cardEl.querySelector("a");
    if (!link) return;

    const url = new URL(link.href);
    const id = url.searchParams.get("id");

    if (!id) return;

    const btn = document.createElement("button");
    btn.className = "bookmark-btn";
    btn.innerHTML = "♡";
    btn.title = "Save article";

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      saveBookmark(id);
      btn.innerHTML = "♥";
    });

    cardEl.appendChild(btn);
  });
}

function saveRecentlyViewed() {
  const id = getParam("id");
  if (!id) return;

  const list = JSON.parse(localStorage.getItem("git-recent") || "[]");
  const updated = [id].concat(list.filter(function (x) { return x !== id; })).slice(0, 10);

  localStorage.setItem("git-recent", JSON.stringify(updated));
}

function renderRecentlyViewed() {
  const box = document.getElementById("recentlyViewed");
  if (!box) return;

  const list = JSON.parse(localStorage.getItem("git-recent") || "[]");

  const articles = list
    .map(function (id) {
      return allArticles.find(function (a) { return a.id === id; });
    })
    .filter(Boolean);

  box.innerHTML = articles.map(function (a) {
    return '<a href="article.html?id=' + a.id + '">' + escapeHTML(a.title) + '</a>';
  }).join("");
}

document.addEventListener("DOMContentLoaded", function () {
  initDarkMode();
  initReadingProgress();
  initScrollTopButton();
  initShareButtons();
  saveRecentlyViewed();

  setTimeout(function () {
    renderBookmarkButtons();
    renderRecentlyViewed();
  }, 1000);
});

const oldRenderEverythingPart9 = renderEverything;

renderEverything = function () {
  oldRenderEverythingPart9();
  renderBookmarkButtons();
  renderRecentlyViewed();
};
/* =========================================================
   PART 10 — MOBILE MEGA MENU + CATEGORY PAGE UPGRADE
========================================================= */

function initMobileMegaMenu() {
  const nav = document.getElementById("megaNav");
  const wrap = document.getElementById("megaMenuWrap");

  if (!nav || !wrap) return;

  let btn = document.getElementById("mobileMegaBtn");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "mobileMegaBtn";
    btn.innerHTML = "☰ Menu";
    nav.parentNode.insertBefore(btn, nav);
  }

  btn.addEventListener("click", function () {
    nav.classList.toggle("mobile-open");
  });

  nav.querySelectorAll(".mega-nav-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.innerWidth > 768) return;

      const menuName = link.getAttribute("data-menu");

      if (menuName && TOP_MENU[menuName]) {
        e.preventDefault();
        openMobileMegaPanel(menuName);
      }
    });
  });
}

function openMobileMegaPanel(menuName) {
  const wrap = document.getElementById("megaMenuWrap");
  const menu = TOP_MENU[menuName];

  if (!wrap || !menu) return;

  let html = "";
  html += '<div class="mobile-mega-panel">';
  html += '<div class="mobile-mega-head">';
  html += '<h2>' + escapeHTML(menuName) + '</h2>';
  html += '<button onclick="closeMegaPanel()">×</button>';
  html += '</div>';
  html += '<p>' + escapeHTML(menu.desc) + '</p>';

  menu.cols.forEach(function (col, index) {
    html += '<div class="mobile-accordion">';
    html += '<button class="mobile-accordion-btn" data-acc="' + index + '">';
    html += escapeHTML(col[0]) + ' <span>+</span>';
    html += '</button>';

    html += '<div class="mobile-accordion-body">';
    for (let i = 1; i < col.length; i++) {
      html += '<a href="category.html?topic=' + slugify(col[i]) + '">';
      html += escapeHTML(col[i]);
      html += '</a>';
    }
    html += '</div>';
    html += '</div>';
  });

  html += '</div>';

  wrap.innerHTML = html;
  wrap.classList.add("active");

  wrap.querySelectorAll(".mobile-accordion-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const parent = btn.parentElement;
      parent.classList.toggle("open");

      const span = btn.querySelector("span");
      if (span) span.textContent = parent.classList.contains("open") ? "−" : "+";
    });
  });
}

/* ================= CATEGORY HERO UPGRADE ================= */

function renderCategoryHero() {
  const root = document.getElementById("categoryArticles");
  if (!root) return;

  const topic = getParam("topic") || "us";
  const articles = getCategoryArticles ? getCategoryArticles(topic) : filterCategory(topic);

  const hero = articles[0];
  const rest = articles.slice(1);

  let html = "";
  html += '<section class="category-hero">';
  html += '<p class="eyebrow">GLOBAL INTEL TIMES</p>';
  html += '<h1>' + titleCase(topic) + '</h1>';
  html += '<p>Latest ' + titleCase(topic) + ' news, analysis and updates.</p>';
  html += '</section>';

  if (hero) {
    html += '<section class="category-feature">';
    html += bigCard(hero);
    html += '</section>';
  }

  html += '<section class="category-grid">';
  html += rest.length ? rest.map(card).join("") : '<p>No more updates right now.</p>';
  html += '</section>';

  root.innerHTML = html;
}

/* ================= AUTO INIT PART 10 ================= */

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    initMobileMegaMenu();

    if (document.getElementById("categoryArticles")) {
      renderCategoryHero();
    }
  }, 1200);
});
