import {json,fetchJson} from './_utils.js';
export async function onRequestGet({request,env}){
  const city=new URL(request.url).searchParams.get('city')||'New York';
  try{
    if(env.WEATHER_API_KEY){
      const d=await fetchJson(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${env.WEATHER_API_KEY}`);
      return json({city,temp:Math.round(d.main?.temp),condition:d.weather?.[0]?.description||'Live weather',humidity:d.main?.humidity,wind:`${Math.round(d.wind?.speed||0)} mph`});
    }
    const geo=await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const place=geo.results?.[0]||{latitude:40.7128,longitude:-74.006,name:'New York'};
    const w=await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
    return json({city:place.name||city,temp:Math.round(w.current?.temperature_2m||0),condition:weatherLabel(w.current?.weather_code),humidity:w.current?.relative_humidity_2m,wind:`${Math.round(w.current?.wind_speed_10m||0)} mph`});
  }catch(e){return json({city,temp:'--',condition:'Weather unavailable',humidity:'--',wind:'--',error:e.message})}
}
function weatherLabel(code){code=Number(code);if(code===0)return'Clear sky';if(code<4)return'Partly cloudy';if(code<50)return'Fog';if(code<70)return'Rain';if(code<80)return'Snow';if(code<90)return'Showers';return'Thunderstorm'}
