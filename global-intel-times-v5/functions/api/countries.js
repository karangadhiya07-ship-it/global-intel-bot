import {json,fetchJson} from './_utils.js';

const COUNTRIES = ['United States','China','Russia','Ukraine','India','United Kingdom','Israel','Iran','Japan','Germany','France','Brazil'];

export async function onRequestGet({request}) {
  const u = new URL(request.url);
  const country = u.searchParams.get('country');
  if (country) return countryNews(country);
  return json({countries: COUNTRIES.map(name => ({name, slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), url:`/countries.html?country=${encodeURIComponent(name)}`}))});
}

async function countryNews(country) {
  try {
    const d = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(country)}&mode=ArtList&format=json&maxrecords=30&sort=HybridRel`);
    const articles = (d.articles || []).map(a => ({
      title:a.title, url:a.url, source:a.domain || a.sourceCountry || 'GDELT', time:a.seendate, image:a.socialimage || '', description:a.snippet || ''
    }));
    const riskScore = Math.min(100, articles.filter(a => /war|conflict|attack|crisis|earthquake|fire|market/i.test(a.title)).length * 12 + 20);
    return json({country, riskScore, risk:riskScore>70?'High':riskScore>40?'Medium':'Low', articles});
  } catch(e) {
    return json({country, riskScore:0, risk:'Unknown', articles:[], error:e.message});
  }
}
