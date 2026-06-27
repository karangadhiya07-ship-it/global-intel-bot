# Global Intel Times V8 - AdSense Safe News Refresh

This version does not auto-refresh the page or ad slots. It checks for new stories every 60 seconds in the background and shows a user-click button: "new stories available".

## What changed

- Homepage loads only the first page of articles for speed.
- Infinite scroll loads older stories page by page.
- Every 1 minute the frontend checks for new stories.
- Old stories remain in the news archive and continue appearing lower as the user scrolls.
- The API supports `page`, `limit`, `since`, `id`, and `refresh`.
- Article cards have fixed image ratios and cleaned text rendering.

## Important Cloudflare setup for saving old articles

Create a KV namespace and bind it to one of these names:

- `ARTICLES_KV` recommended
- `NEWS_KV`
- `GIT_NEWS_KV`

Without KV, the site still works, but the archive is not guaranteed to persist across Cloudflare isolates.

## Optional endpoint

Call this endpoint from an external cron or manually to force refresh:

`/api/refresh-news?topic=latest`

The normal website also refreshes cache automatically when `/api/news` is requested and the cache is older than 60 seconds.
