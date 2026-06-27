# Global Intel Times V8 Final Build

This build fixes the main production issues:

- Clean RSS text rendering: raw `<p>`, `<a>`, RSS HTML is removed before display.
- Consistent image sizes: all cards use fixed 16:9 thumbnails with object-fit cover.
- Better article page: headline, source, date, intelligence summary, tags, related stories and original-source button.
- More articles: four RSS groups plus NewsAPI/GNews support aggregate hundreds of stories when sources are reachable.
- Infinite scroll: homepage/category pages load more stories without loading everything at once.
- AdSense-safe refresh: every 60 seconds the site checks for new stories in background and shows a button. It does not auto-refresh ads or force reload the page.
- Archive support: if you bind a KV namespace as `ARTICLES_KV`, `NEWS_ARCHIVE`, or `GIT_ARCHIVE`, the API keeps old articles for up to 30 days and merges them with new stories.
- Better fallback image: no broken black cards or missing `og-image.svg` errors.
- Syntax checked with `node --check` for frontend and Cloudflare Functions files.

## Recommended Cloudflare KV binding

Create a KV namespace and bind it to Pages Functions with one of these names:

`ARTICLES_KV`

Then deploy. Old articles will remain available instead of disappearing when feeds update.

## Environment variables already supported

- `GNEWS_API_KEY`
- `NEWS_API_KEY`
- `WEATHER_API_KEY`
- `FINNHUB_API_KEY`

Other finance APIs can remain configured; current market endpoint uses Finnhub when available and safe fallback otherwise.
