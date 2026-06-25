const params = new URLSearchParams(window.location.search);
const topic = (params.get("topic") || "us").toLowerCase();

const categoryTitle = document.getElementById("categoryTitle");
const categorySub = document.getElementById("categorySub");
const categoryFeed = document.getElementById("categoryFeed");
const todayDate = document.getElementById("todayDate");

if (todayDate) {
  todayDate.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

const topicNames = {
  "us": "U.S.",
  "politics": "Politics",
  "new-york": "New York",
  "california": "California",
  "education": "Education",
  "health": "Health",
  "science": "Science",
  "climate": "Climate",
  "weather": "Weather",
  "sports": "Sports",
  "business": "Business",
  "technology": "Technology",
  "tech": "Technology",
  "markets": "Markets",
  "stock-market": "Stock Market",
  "ai": "Artificial Intelligence",
  "bitcoin": "Bitcoin",
  "crypto": "Crypto",
  "world": "World",
  "arts": "Arts",
  "lifestyle": "Lifestyle",
  "opinion": "Opinion",
  "video": "Video",
  "audio": "Audio",
  "games": "Games",
  "cooking": "Cooking",
  "wirecutter": "Wirecutter",
  "the-athletic": "The Athletic"
};

const allArticles = [
  {
    title: "New York Faces New Housing And Cost Of Living Pressure",
    description: "New York residents continue to watch rent, jobs, transit and city policy as affordability remains a major issue.",
    topic: "new-york",
    section: "U.S.",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200"
  },
  {
    title: "Congress Faces New Debate Over Spending And Taxes",
    description: "Lawmakers are under pressure as voters focus on prices, jobs, housing and national priorities.",
    topic: "politics",
    section: "Politics",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200"
  },
  {
    title: "Weather Systems Bring Travel Concerns Across The United States",
    description: "Forecast models show changing weather patterns that could affect travel, energy demand and local communities.",
    topic: "weather",
    section: "Weather",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200"
  },
  {
    title: "US Stock Market Opens Higher As Traders Track Economic Data",
    description: "Investors react to inflation signals, earnings expectations and Federal Reserve commentary.",
    topic: "stock-market",
    section: "Markets",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200"
  },
  {
    title: "Nvidia And Microsoft Lead AI Market Expansion",
    description: "Artificial intelligence investments continue driving major technology companies higher.",
    topic: "ai",
    section: "Technology",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
  },
  {
    title: "Bitcoin Traders Watch Key Resistance Levels",
    description: "Crypto investors remain focused on market liquidity, regulation and institutional demand.",
    topic: "bitcoin",
    section: "Crypto",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200"
  }
];

function cleanSlug(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeArticleCard(article, index) {
  return `
    <article class="news-card">
      <a href="article.html?id=${index}">
        <img loading="lazy" src="${article.image}" alt="${article.title}">
        <span class="section-label">${article.section}</span>
        <h2>${article.title}</h2>
        <p>${article.description}</p>
        <small>Source: Global Intel Times</small>
        <div class="read-more-btn">Read Full Story →</div>
      </a>
    </article>
  `;
}

function renderCategory() {
  const title = topicNames[topic] || topic.replace(/-/g, " ").toUpperCase();

  document.title = `${title} | Global Intel Times`;
  categoryTitle.textContent = title;
  categorySub.textContent = `Latest ${title} articles`;

  let filtered = allArticles.filter(article => {
    return (
      article.topic === topic ||
      cleanSlug(article.section) === topic ||
      cleanSlug(article.title).includes(topic)
    );
  });

  if (!filtered.length) {
    filtered = allArticles.filter(article =>
      article.title.toLowerCase().includes(topic.replace(/-/g, " "))
    );
  }

  if (!filtered.length) {
    categoryFeed.innerHTML = `
      <div class="loading">
        No articles found for ${title}. Add articles for this topic in category.js.
      </div>
    `;
    return;
  }

  categoryFeed.innerHTML = filtered.map(makeArticleCard).join("");
}

renderCategory();
