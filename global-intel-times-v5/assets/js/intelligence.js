"use strict";
console.log("VERSION 27-JUNE-TEST");
window.DEFAULT_IMG = window.DEFAULT_IMG || "./assets/images/og-image.svg";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Intelligence JS started");

  await Promise.allSettled([
    renderEarthquakes(),
    renderWildfires(),
    renderWeatherAlerts(),
    renderConflicts(),
    renderRisk(),
    renderCountries(),
    renderAdmin()
  ]);
});

async function getJSON(url){
  console.log("Fetching:", url);
  const r = await fetch(url,{cache:"no-store"});
  if(!r.ok) throw new Error(url);
  return r.json();
}

function html(id, value){
  const el=document.getElementById(id);
  if(el) el.innerHTML=value || "";
}

function badge(level){
  const l=String(level||"Low").toLowerCase();
  return `<span class="intel-badge ${l}">${level||"Low"}</span>`;
}

function esc(v){
  return String(v||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

async function renderEarthquakes(){
  const el=document.getElementById("earthquakeList");
  if(!el) return;

  try{
    const d=await getJSON("/api/earthquakes?minmag=4.5");
    html("earthquakeList",(d.events||[]).slice(0,10).map(e=>`
      <div class="intel-item">
        ${badge(e.risk)}
        <b>${esc(e.title)}</b><br>
        <small>${esc(e.place)} · M${e.magnitude} · ${new Date(e.time).toLocaleString()}</small>
      </div>
    `).join(""));
  }catch(e){
    console.error("Earthquake error:", e);
    html("earthquakeList","Earthquake feed unavailable.");
  }
}

async function renderWildfires(){
  const el=document.getElementById("wildfireList");
  if(!el) return;

  try{
    const d=await getJSON("/api/wildfires");
    html("wildfireList",(d.events||[]).slice(0,10).map(e=>`
      <div class="intel-item">
        ${badge(e.risk)}
        <b>${esc(e.title)}</b><br>
        <small>${new Date(e.time).toLocaleString()}</small>
      </div>
    `).join(""));
  }catch(e){
    console.error("Wildfire error:", e);
    html("wildfireList","Wildfire feed unavailable.");
  }
}

async function renderWeatherAlerts(){
  const el=document.getElementById("weatherAlertList");
  if(!el) return;

  try{
    const d=await getJSON("/api/weather-alerts");
    html("weatherAlertList",(d.alerts||[]).slice(0,12).map(a=>`
      <div class="intel-item">
        ${badge(a.level)}
        <b>${esc(a.city)}</b> — ${esc(a.title)}<br>
        <small>${a.temp??"--"}°C · wind ${a.wind??"--"}</small>
      </div>
    `).join(""));
  }catch(e){
    console.error("Weather alert error:", e);
    html("weatherAlertList","Weather alerts unavailable.");
  }
}

async function renderConflicts(){
  const el=document.getElementById("conflictList");
  if(!el) return;

  try{
    const d=await getJSON("/api/conflicts");
    html("conflictList",(d.events||[]).slice(0,12).map(e=>`
      <div class="intel-item">
        ${badge(e.risk)}
        <a href="${e.url}" target="_blank" rel="noopener"><b>${esc(e.title)}</b></a><br>
        <small>${esc(e.source)} · ${esc(e.time)}</small>
      </div>
    `).join(""));
  }catch(e){
    console.error("Conflict error:", e);
    html("conflictList","Conflict feed unavailable.");
  }
}

async function renderRisk(){
  const el=document.getElementById("riskBox");
  if(!el) return;

  try{
    const d=await getJSON("/api/risk");
    html("riskBox",`
      <div class="risk-score">${d.score}</div>
      ${badge(d.level)}
      <p>Global risk level based on earthquakes, wildfires, conflicts and weather alerts.</p>
      <small>Updated ${new Date(d.updatedAt).toLocaleString()}</small>
    `);
  }catch(e){
    console.error("Risk error:", e);
    html("riskBox","Risk engine unavailable.");
  }
}

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

      html("countryDetail",`
        <div class="intel-card">
          <h3>Risk Score</h3>
          <div class="risk-score">${d.riskScore}</div>
          ${badge(d.risk)}
        </div>

        <div class="article-grid">
          ${(d.articles||[]).slice(0,18).map(a=>`
            <article class="news-card">
              <a href="${a.url}" target="_blank" rel="noopener">
                <img src="${a.image||window.DEFAULT_IMG}" onerror="this.src='${window.DEFAULT_IMG}'">
                <span class="news-category">${esc(a.source)}</span>
                <h3>${esc(a.title)}</h3>
                <p>${esc(a.description||"Country intelligence update.")}</p>
              </a>
            </article>
          `).join("")}
        </div>
      `);
    }catch(e){
      console.error("Country error:", e);
      html("countryDetail","Country data unavailable.");
    }
  }

  if(list){
    try{
      const d=await getJSON("/api/countries");

      html("countryList",(d.countries||[]).map(c=>`
        <a class="market-pill" href="./countries.html?country=${encodeURIComponent(c.name)}">
          <span>${esc(c.name)}</span>
          <strong>Open</strong>
        </a>
      `).join(""));
    }catch(e){
      console.error("Country list error:", e);
      html("countryList","Countries unavailable.");
    }
  }
}

async function renderAdmin(){
  const el=document.getElementById("adminStatus");
  if(!el) return;

  try{
    const d=await getJSON("/api/admin");

    html("adminStatus",`
      <table class="admin-table">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Status</th>
            <th>Count</th>
            <th>MS</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          ${(d.endpoints||[]).map(x=>`
            <tr>
              <td>${esc(x.name)}</td>
              <td>${x.ok?"✅":"❌"} ${x.status||""}</td>
              <td>${x.count||0}</td>
              <td>${x.ms||"-"}</td>
              <td>${esc(x.error||"")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `);
  }catch(e){
    console.error("Admin error:", e);
    html("adminStatus","Admin status unavailable.");
  }
}
