import { weatherClient, geocodingClient } from './httpClient.js'
import { getCache, setCache, TTL } from '@/utils/cache.js'

/**
 * patron: LLAMADAS DEPENDIENTES
 * 1) geocodingClient => obtiene lat/lon a partir del nombre de ciudad
 * 2) weatherClient   => usa lat/lon para obtener el pronostico
 * esta es la implementacion requerida de "llamadas dependientes"
 * paso 1: geocodificacion — ciudad => coordenadas
 * @param {string} cityName
 */
async function geocodeCity(cityName) {
  const { data } = await geocodingClient.get('/search', {
    params: { name: cityName, count: 1, language: 'es', format: 'json' }
  })
  if (!data.results?.length) throw { message: `No se encontró "${cityName}"`, status: 404 }
  return data.results[0] // { latitude, longitude, name, country, ... }
}

/**
 * Paso 2: pronostico — lat/lon → datos del clima (7 dias)
 * @param {number} lat
 * @param {number} lon
 */
async function fetchForecast(lat, lon) {
  const { data } = await weatherClient.get('/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'weathercode',
        'windspeed_10m_max'
      ].join(','),
      current_weather: true,
      timezone: 'auto',
      forecast_days: 7
    }
  })
  return data
}

/**
 * funcion principal: obtiene pronostico completo para una ciudad
 * LLAMADA DEPENDIENTE: primero geocodifica, luego obtiene clima
 *
 * @param {string} cityName
 * @param {number[]} [latlng] - Coordenadas directas (opcional, evita geocodificación)
 */
export async function getWeatherForCity(cityName, latlng = null) {
  const cacheKey = `weather_${cityName.toLowerCase()}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  let lat, lon, locationName

  if (latlng?.length === 2) {
    // si tengo coordenadas del pais, la uso directamente
    ;[lat, lon] = latlng
    locationName = cityName
  } else {
    // LLAMADA 1: geocodificacion (depende del nombre)
    const geo = await geocodeCity(cityName)
    lat = geo.latitude
    lon = geo.longitude
    locationName = `${geo.name}, ${geo.country}`
  }

  // LLAMADA 2: pronostico (depende del resultado de llamada 1)
  const forecast = await fetchForecast(lat, lon)

  const result = {
    location: locationName,
    current: {
      temp: forecast.current_weather.temperature,
      windspeed: forecast.current_weather.windspeed,
      weathercode: forecast.current_weather.weathercode,
      isDay: forecast.current_weather.is_day === 1
    },
    daily: forecast.daily.time.map((date, i) => ({
      date,
      tempMax: forecast.daily.temperature_2m_max[i],
      tempMin: forecast.daily.temperature_2m_min[i],
      precipitation: forecast.daily.precipitation_sum[i],
      weathercode: forecast.daily.weathercode[i],
      windspeed: forecast.daily.windspeed_10m_max[i]
    })),
    timezone: forecast.timezone
  }

  setCache(cacheKey, result, TTL.WEATHER)
  return result
}

/**
 * interpreto el WMO Weather Code y devuelve texto + emoji
 */
export function interpretWeatherCode(code) {
  const map = {
    0:  { text: 'Despejado', emoji: '☀️' },
    1:  { text: 'Mayormente despejado', emoji: '🌤️' },
    2:  { text: 'Parcialmente nublado', emoji: '⛅' },
    3:  { text: 'Nublado', emoji: '☁️' },
    45: { text: 'Niebla', emoji: '🌫️' },
    48: { text: 'Niebla con escarcha', emoji: '🌫️' },
    51: { text: 'Llovizna leve', emoji: '🌦️' },
    53: { text: 'Llovizna moderada', emoji: '🌦️' },
    55: { text: 'Llovizna intensa', emoji: '🌧️' },
    61: { text: 'Lluvia leve', emoji: '🌧️' },
    63: { text: 'Lluvia moderada', emoji: '🌧️' },
    65: { text: 'Lluvia intensa', emoji: '🌧️' },
    71: { text: 'Nevada leve', emoji: '🌨️' },
    73: { text: 'Nevada moderada', emoji: '❄️' },
    75: { text: 'Nevada intensa', emoji: '❄️' },
    80: { text: 'Chubascos leves', emoji: '🌦️' },
    81: { text: 'Chubascos moderados', emoji: '🌧️' },
    82: { text: 'Chubascos fuertes', emoji: '⛈️' },
    95: { text: 'Tormenta', emoji: '⛈️' },
    96: { text: 'Tormenta con granizo', emoji: '⛈️' },
    99: { text: 'Tormenta fuerte con granizo', emoji: '⛈️' }
  }
  return map[code] || { text: 'Variable', emoji: '🌡️' }
}

/**
 * genero recomendaciones de viaje basadas en el pronostico
 * analizo temperatura promedio, precipitacion y biento.
 *
 * @param {object} weatherData - resultado de getWeatherForCity()
 * @returns {object} { rating, items: string[], advice: string }
 */
export function getTravelRecommendation(weatherData) {
  if (!weatherData?.daily?.length) return null

  const temps = weatherData.daily.map(d => (d.tempMax + d.tempMin) / 2)
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
  const maxPrec = Math.max(...weatherData.daily.map(d => d.precipitation))
  const avgWind = weatherData.daily.reduce((a, d) => a + d.windspeed, 0) / weatherData.daily.length

  const items = []
  let rating = 'Excelente'

  // temperatura
  if (avgTemp < 5)       { items.push('🧥 Abrigo pesado', '🧣 Bufanda y guantes', '👢 Botas impermeables'); rating = 'Frío' }
  else if (avgTemp < 15) { items.push('🧥 Chaqueta', '🧤 Guantes ligeros', '👖 Pantalones largos') }
  else if (avgTemp < 25) { items.push('👕 Ropa de primavera', '🧥 Chaqueta para la noche') }
  else if (avgTemp < 32) { items.push('👕 Ropa ligera', '🕶️ Gafas de sol', '🧴 Protector solar') }
  else                   { items.push('🌡️ Ropa muy ligera', '💧 Hidratación constante', '🧴 Protector solar FPS50+'); rating = 'Caluroso' }

  // lluvia
  if (maxPrec > 20)      { items.push('☂️ Paraguas resistente', '🧥 Impermeable'); rating = 'Lluvioso' }
  else if (maxPrec > 5)  { items.push('☂️ Paraguas plegable') }

  // biento
  if (avgWind > 40)      { items.push('🧣 Protección para el viento') }

  const advice = generateAdvice(avgTemp, maxPrec, rating)

  return { rating, items: [...new Set(items)], advice, avgTemp: Math.round(avgTemp) }
}

function generateAdvice(temp, prec, rating) {
  if (rating === 'Lluvioso') return 'Planifica actividades bajo techo y lleva impermeable. Los días de lluvia son perfectos para museos y gastronomía local.'
  if (rating === 'Frío') return 'El frío no impide explorar. Viste en capas y disfruta de las plazas con cafés calientes y la arquitectura sin multitudes.'
  if (rating === 'Caluroso') return 'Sal temprano o al atardecer para evitar el calor del mediodía. Busca zonas con sombra y fuentes locales.'
  if (temp >= 18 && prec < 5) return '¡Condiciones ideales para explorar! Perfecto para actividades al aire libre, caminatas y terrazas.'
  return 'Condiciones favorables en general. Ideal para combinar actividades de interior y exterior.'
}
