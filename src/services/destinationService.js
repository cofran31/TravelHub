//patron: EJECUCIÓN CONCURRENTE con Promise.allSettled

import { searchCountries } from './countriesService.js'
import { getWeatherForCity } from './weatherService.js'
import { getDestinationImages } from './imagesService.js'
import { getExchangeRates } from './exchangeService.js'

/**
 * carga todos los datos de un destino de forma concurrente
 *
 * @param {string} countryName - Nombre del país a explorar
 * @returns {Promise<{country, weather, images, exchange, errors}>}
 */
export async function loadDestinationData(countryName) {
  // LLAMADA 1 (bloqueante): necesitamos el país para obtener
  // capital, moneda y coordenadas → dependencia real
  const countries = await searchCountries(countryName)
  if (!countries?.length) throw { message: `No se encontró "${countryName}"`, status: 404 }

  const country = countries[0]
  const currencyCode = country.currencies?.[0]?.code || 'USD'
  const capital = country.capital || countryName
  const latlng = country.latlng

  // LLAMADAS 2, 3, 4 — CONCURRENTES con Promise.allSettled
  // Se lanzan todas al mismo tiempo para reducir el tiempo total de carga
  // Si una falla, las demás siguen adelante (resiliencia)
  const [weatherResult, imagesResult, exchangeResult] = await Promise.allSettled([
    getWeatherForCity(capital, latlng),          // Depende de capital (llamada dependiente)
    getDestinationImages(`${countryName} travel`), // Independiente
    getExchangeRates(currencyCode)               // Independiente
  ])

  // extraemos datos y errores de cada resultado
  const errors = {}

  const weather = weatherResult.status === 'fulfilled'
    ? weatherResult.value
    : (errors.weather = weatherResult.reason?.message || 'Error al cargar el clima', null)

  const images = imagesResult.status === 'fulfilled'
    ? imagesResult.value
    : (errors.images = imagesResult.reason?.message || 'Error al cargar imágenes', null)

  const exchange = exchangeResult.status === 'fulfilled'
    ? exchangeResult.value
    : (errors.exchange = exchangeResult.reason?.message || 'Error al cargar divisas', null)

  return { country, weather, images, exchange, errors }
}
