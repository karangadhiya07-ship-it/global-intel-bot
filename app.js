console.log("APP JS LOADED");
async function searchNews() {
  const query = document.getElementById("searchInput").value;

  const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
  const data = await response.json();

  const feed = document.getElementById("feed");

  if (!data.results || data.results.length === 0) {
    feed.innerHTML = "<p>No news found.</p>";
    return;
  }

  feed.innerHTML = data.results
    .slice(0, 10)
    .map(
      item => `
      <div class="news-card">
        <h3>${item.title}</h3>
        <p>${item.description || ""}</p>
        <a href="${item.link}" target="_blank">Read More</a>
      </div>
    `
    )
    .join("");
}
