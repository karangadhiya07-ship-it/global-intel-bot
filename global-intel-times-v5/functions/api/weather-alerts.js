import {json,fetchJson} from './_utils.js';

const CITIES = ['New York','Washington','London','Tokyo','Paris','Dubai','Singapore','Sydney'];

export async function onRequestGet({env}) {
  let alerts = [];
  let errors = [];
  if (!env.WEATHER_API_KEY) {
    return json({source:'OpenWeather', alerts:[{city:'New York', level:'Info', title:'Weather API key not configured', description:'Add WEATHER_API_KEY to enable live alerts.'}], error:'WEATHER_API_KEY missing'});
  }

  await Promise.allSettled(CITIES.map(async city => {
    try {
      const d = await fetchJson(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${env.WEATHER_API_KEY}&units=metric`);
      const temp = d.main?.temp;
      const wind = d.wind?.speed;
      const condition = d.weather?.[0]?.description || 'Weather update';
      let level = 'Low';
      if (temp >= 38 || wind >= 18) level = 'High';
      else if (temp >= 32 || wind >= 11) level = 'Medium';
      alerts.push({city, level, title: condition, temp, wind, humidity:d.main?.humidity, time:new Date().toISOString()});
    } catch(e) {
      errors.push(`${city}: ${e.message}`);
    }
  }));

  return json({source:'OpenWeather', count:alerts.length, alerts, error:errors.length?errors.slice(0,4).join(' | '):undefined});
}
