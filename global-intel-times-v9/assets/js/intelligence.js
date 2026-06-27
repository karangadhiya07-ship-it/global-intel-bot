"use strict";

window.GIT_DEFAULT_IMG = window.GIT_DEFAULT_IMG || "./assets/images/og-image.svg";

document.addEventListener("DOMContentLoaded", async () => {
  setTimeout(initIntel, document.body.dataset.lazyIntel === "true" ? 1200 : 0);
});

async function initIntel(){
  console.log("Global Intel Times v7 World Monitor style started");
  await Promise.allSettled([renderRisk(),renderEarthquakes(),renderWildfires(),renderConflicts(),renderCountries(),renderAdmin(),renderIntelMap()]);
}

async function getJSON(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error(url);return r.json()}
function html(id,value){const el=document.getElementById(id);if(el)el.innerHTML=value||""}
function esc(v){return String(v||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function badge(level){const l=String(level||"Low").toLowerCase();return `<span class="intel-badge ${l}">${level||"Low"}</span>`}

async function renderRisk(){if(!document.getElementById("riskBox"))return;try{const d=await getJSON("/api/risk");html("riskBox",`<div class="risk-score">${d.score}</div>${badge(d.level)}<p>Global risk level from earthquakes, wildfires and conflicts.</p><small>Updated ${new Date(d.updatedAt).toLocaleString()}</small>`)}catch(e){html("riskBox","Risk engine unavailable.")}}

async function renderEarthquakes(){if(!document.getElementById("earthquakeList"))return;try{const d=await getJSON("/api/earthquakes?minmag=4.5");html("earthquakeList",(d.events||[]).slice(0,12).map(e=>`<div class="intel-item">${badge(e.risk)}<b>${esc(e.title)}</b><br><small>${esc(e.place)} · M${e.magnitude} · ${new Date(e.time).toLocaleString()}</small></div>`).join(""))}catch(e){html("earthquakeList","Earthquake feed unavailable.")}}

async function renderWildfires(){if(!document.getElementById("wildfireList"))return;try{const d=await getJSON("/api/wildfires");html("wildfireList",(d.events||[]).slice(0,12).map(e=>`<div class="intel-item">${badge(e.risk)}<b>${esc(e.title)}</b><br><small>${new Date(e.time).toLocaleString()}</small></div>`).join(""))}catch(e){html("wildfireList","Wildfire feed unavailable.")}}

async function renderConflicts(){if(!document.getElementById("conflictList"))return;try{const d=await getJSON("/api/conflicts");html("conflictList",(d.events||[]).slice(0,14).map(e=>`<div class="intel-item">${badge(e.risk)}<a href="${e.url}" target="_blank" rel="noopener"><b>${esc(e.title)}</b></a><br><small>${esc(e.source)} · ${esc(e.time)}</small></div>`).join(""))}catch(e){html("conflictList","Conflict feed unavailable.")}}

async function renderCountries(){
  const list=document.getElementById("countryList"), detail=document.getElementById("countryDetail");
  if(!list&&!detail)return;
  const country=new URLSearchParams(location.search).get("country");
  if(country&&detail){try{const d=await getJSON(`/api/countries?country=${encodeURIComponent(country)}`);document.title=`${country} Intelligence | Global Intel Times`;html("countryTitle",`${esc(country)} Intelligence`);html("countryDetail",`<div class="intel-card"><h3>Risk Score</h3><div class="risk-score">${d.riskScore}</div>${badge(d.risk)}</div><div class="article-grid">${(d.articles||[]).slice(0,18).map(a=>`<article class="news-card"><a href="${a.url}" target="_blank" rel="noopener"><img src="${a.image||window.GIT_DEFAULT_IMG}" onerror="this.src='${window.GIT_DEFAULT_IMG}'"><span class="news-category">${esc(a.source)}</span><h3>${esc(a.title)}</h3><p>${esc(a.description||"Country intelligence update.")}</p></a></article>`).join("")}</div>`)}catch(e){html("countryDetail","Country data unavailable.")}}
  if(list){try{const d=await getJSON("/api/countries");html("countryList",(d.countries||[]).map(c=>`<a class="market-pill" href="./countries.html?country=${encodeURIComponent(c.name)}"><span>${esc(c.name)}</span><strong>Open</strong></a>`).join(""))}catch(e){html("countryList","Countries unavailable.")}}
}

async function renderAdmin(){if(!document.getElementById("adminStatus"))return;try{const d=await getJSON("/api/admin");html("adminStatus",`<table class="admin-table"><thead><tr><th>Endpoint</th><th>Status</th><th>Count</th><th>MS</th><th>Error</th></tr></thead><tbody>${(d.endpoints||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${x.ok?"✅":"❌"} ${x.status||""}</td><td>${x.count||0}</td><td>${x.ms||"-"}</td><td>${esc(x.error||"")}</td></tr>`).join("")}</tbody></table>`)}catch(e){html("adminStatus","Admin status unavailable.")}}

async function renderIntelMap(){
  const mapEl=document.getElementById("intelMap");
  if(!mapEl || !window.L)return;
  const map=L.map("intelMap",{worldCopyJump:true}).setView([20,0],2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:7,attribution:"© OpenStreetMap"}).addTo(map);
  const layers={Earthquakes:L.layerGroup().addTo(map),Wildfires:L.layerGroup().addTo(map)};
  try{
    const [q,f]=await Promise.all([getJSON("/api/earthquakes?minmag=4.5"),getJSON("/api/wildfires")]);
    (q.events||[]).forEach(e=>{const c=e.coordinates;if(c&&c.lat&&c.lon)L.circleMarker([c.lat,c.lon],{radius:Math.max(5,Number(e.magnitude||4)),color:"#d71920",fillOpacity:.7}).bindPopup(`<b>${esc(e.title)}</b><br>M${e.magnitude}<br>${esc(e.place)}`).addTo(layers.Earthquakes)});
    (f.events||[]).forEach(e=>{const c=e.coordinates;if(c&&c.lat&&c.lon)L.circleMarker([c.lat,c.lon],{radius:7,color:"#ff7a00",fillOpacity:.7}).bindPopup(`<b>${esc(e.title)}</b><br>Wildfire`).addTo(layers.Wildfires)});
    L.control.layers(null,layers).addTo(map);
  }catch(e){console.error(e)}
}
