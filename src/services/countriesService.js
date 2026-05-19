import { countriesClient } from './httpClient.js'
import { getCache, setCache, TTL } from '@/utils/cache.js'

/**
 * busca paises por nombre.
 * implementa caché de 24h ya que la información geografica
 * es estatica y no cambia entre sesiones
 *
 */
export async function searchCountries(name) {
  const cacheKey = `countries_${name.toLowerCase()}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  const { data } = await countriesClient.get(`/name/${encodeURIComponent(name)}`)

  // normalizo los datos para exponer solo los campos necesarios
  const result = data.map(country => ({
    name: country.name.common,
    officialName: country.name.official,
    capital: country.capital?.[0] || 'N/D',
    population: country.population,
    region: country.region,
    subregion: country.subregion,
    languages: Object.values(country.languages || {}),
    currencies: Object.values(country.currencies || {}).map(c => ({
      name: c.name,
      symbol: c.symbol,
      code: Object.keys(country.currencies)[0]
    })),
    flag: country.flags?.svg || country.flags?.png,
    flagAlt: country.flags?.alt || '',
    latlng: country.latlng,
    timezones: country.timezones,
    cca2: country.cca2,
    cca3: country.cca3
  }))

  setCache(cacheKey, result, TTL.COUNTRIES)
  return result
}

/**
 * obtenemos informacion de un pais específico por codigo CCA2
 * llamada pendiente (requiere el cca2 obtenido de searchCountries())
 */
export async function getCountryByCode(cca2) {
  const cacheKey = `country_code_${cca2}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  const { data } = await countriesClient.get(`/alpha/${cca2}`)
  const country = data[0]

  const result = {
    name: country.name.common,
    officialName: country.name.official,
    capital: country.capital?.[0] || 'N/D',
    population: country.population,
    region: country.region,
    subregion: country.subregion,
    languages: Object.values(country.languages || {}),
    currencies: Object.entries(country.currencies || {}).map(([code, c]) => ({
      name: c.name, symbol: c.symbol, code
    })),
    flag: country.flags?.svg,
    flagAlt: country.flags?.alt || '',
    latlng: country.latlng,
    timezones: country.timezones,
    borders: country.borders || [],
    area: country.area,
    cca2: country.cca2
  }

  setCache(cacheKey, result, TTL.COUNTRIES)
  return result
}

/** Formatea número de poblacion con separadores de miles */
export function formatPopulation(n) {
  return new Intl.NumberFormat('es').format(n)
}
