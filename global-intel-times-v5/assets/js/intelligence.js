async function renderCountries(){
  const list=document.getElementById("countryList");
  const detail=document.getElementById("countryDetail");
  if(!list && !detail) return;

  const params=new URLSearchParams(location.search);
  const country=params.get("country");

  if(country && detail){
    try{
      const d=await getJSON(`/api/countries?country=${encodeURIComponent(country)}`);
      document.title=`${country} Intelligence | Global Intel Times`;
      html("countryTitle",`${esc(country)} Intelligence`);
      html("countryDetail",`<div class="intel-card"><h3>Risk Score</h3><div class="risk-score">${d.riskScore}</div>${badge(d.risk)}</div><div class="article-grid">${(d.articles||[]).slice(0,18).map(a=>`<article class="news-card"><a href="${a.url}" target="_blank" rel="noopener"><img src="${a.image||window.DEFAULT_IMG}" onerror="this.src='${window.DEFAULT_IMG}'"><span class="news-category">${esc(a.source)}</span><h3>${esc(a.title)}</h3><p>${esc(a.description||"Country intelligence update.")}</p></a></article>`).join("")}</div>`);
    }catch(e){
      html("countryDetail","Country data unavailable.");
    }
  }

  if(list){
    try{
      const d=await getJSON("/api/countries");
      html("countryList",(d.countries||[]).map(c=>`<a class="market-pill" href="./countries.html?country=${encodeURIComponent(c.name)}"><span>${esc(c.name)}</span><strong>Open</strong></a>`).join(""));
    }catch(e){
      html("countryList","Countries unavailable.");
    }
  }
}
