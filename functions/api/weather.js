export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const city = url.searchParams.get("city") || "New York";
  const WEATHER_API_KEY = env.WEATHER_API_KEY || "";

  let weather = null;

  try {
    if (WEATHER_API_KEY) {
      weather = await fetchWeather(city, WEATHER_API_KEY);
    }
  } catch (err) {
    console.log("Weather API error:", err.message);
  }

  if (!weather) weather = fallbackWeather(city);

  return json({
    status: "ok",
    source: "Global Intel Times Weather Engine",
    weather
  });
}

async function fetchWeather(city, key) {
  const api =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    encodeURIComponent(city) +
    "&units=imperial&appid=" +
    key;

  const res = await fetch(api);
  if (!res.ok) return null;

  const data = await res.json();

  return {
    city: data.name,
    country: data.sys?.country || "US",
    temp: Math.round(data.main?.temp),
    feelsLike: Math.round(data.main?.feels_like),
    humidity: data.main?.humidity,
    wind: data.wind?.speed,
    condition: data.weather?.[0]?.main || "Weather",
    description: data.weather?.[0]?.description || "",
    icon: data.weather?.[0]?.icon || "",
    updatedAt: new Date().toISOString(),
    alerts: generateAlerts(data.weather?.[0]?.main)
  };
}

function generateAlerts(condition) {
  const c = String(condition || "").toLowerCase();

  if (c.includes("storm")) return ["Storm risk in nearby areas"];
  if (c.includes("rain")) return ["Rain may affect travel"];
  if (c.includes("snow")) return ["Snow conditions possible"];
  if (c.includes("clear")) return ["No major weather alerts"];

  return ["Monitor local weather updates"];
}

function fallbackWeather(city) {
  return {
    city,
    country: "US",
    temp: 72,
    feelsLike: 74,
    humidity: 58,
    wind: 8,
    condition: "Partly Cloudy",
    description: "fallback forecast",
    icon: "",
    updatedAt: new Date().toISOString(),
    alerts: ["Fallback weather active"]
  };
}

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300"
    }
  });
}
