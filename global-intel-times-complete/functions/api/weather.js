const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=120"
  }
});
const safeFetch = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": "GlobalIntelTimes/1.0" } });
  if (!res.ok) throw new Error("Fetch failed " + res.status);
  return res.json();
};

export async function onRequestGet({ request }) {
  const city = new URL(request.url).searchParams.get("city") || "New York";
  const coords = { "New York":[40.7128,-74.006], "Los Angeles":[34.0522,-118.2437], Chicago:[41.8781,-87.6298], Houston:[29.7604,-95.3698], Miami:[25.7617,-80.1918] };
  const [lat, lon] = coords[city] || coords["New York"];
  try {
    const data = await safeFetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
    const c = data.current || {};
    return json({ city, temp: Math.round(c.temperature_2m), humidity: c.relative_humidity_2m, wind: c.wind_speed_10m + " km/h", condition: "Live forecast" });
  } catch (e) { return json({ city, temp:"--", condition:"Weather unavailable" }); }
}
