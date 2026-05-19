import { exchangeClient, createApiClient } from './httpClient.js'
import { getCache, setCache, TTL } from '@/utils/cache.js'

// cliente alternativo gratuito (Banco Central Europeo via Frankfurter)
//const frankfurterClient = createApiClient('https://api.frankfurter.app')

/**
 * obtengo las tasas de cambio para una moneda base.
 * estrategia: primero intenta ExchangeRate-API, si falla usa Frankfurter.
 *
 * @param {string} baseCurrency 
 * @returns {Promise<{base: string, rates: object, date: string}>}
 */
export async function getExchangeRates(baseCurrency = 'USD') {
  const cacheKey = `exchange_${baseCurrency}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  const apiKey = import.meta.env.VITE_EXCHANGE_KEY

  try {
    if (apiKey && apiKey !== 'YOUR_EXCHANGE_KEY') {
      // Opción A: ExchangeRate-API con key
      const { data } = await exchangeClient.get(`/latest/${baseCurrency}`)
      const result = {
        base: data.base_code,
        rates: data.conversion_rates,
        date: data.time_last_update_utc
      }
      setCache(cacheKey, result, TTL.EXCHANGE)
      return result
    }// else {
      // Opción B: Frankfurter (fallback gratuito sin key)
      //return await getFrankfurterRates(baseCurrency)
    //}
  } catch (err) {
    // Si ExchangeRate-API falla (cuota agotada, etc.), usamos Frankfurter
    console.warn('[Exchange] Fallback a Frankfurter:', err.message)
    return await getFrankfurterRates(baseCurrency)
  }
}

/** Obtiene tasas desde Frankfurter (BCE) */
async function getFrankfurterRates(baseCurrency) {
  const cacheKey = `exchange_frankfurter_${baseCurrency}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  const { data } = await frankfurterClient.get('/latest', {
    params: { from: baseCurrency }
  })

  // Frankfurter no incluye la moneda base en rates, la agregamos
  const result = {
    base: data.base,
    rates: { ...data.rates, [data.base]: 1 },
    date: data.date
  }
  setCache(cacheKey, result, TTL.EXCHANGE)
  return result
}

/**
 * Convierte un monto entre dos monedas.
 *
 * @param {number} amount - Monto a convertir
 * @param {string} from - Moneda origen (ej: "USD")
 * @param {string} to - Moneda destino (ej: "EUR")
 * @param {object} rates - Tasas obtenidas de getExchangeRates()
 * @returns {number} Monto convertido
 */
export function convertCurrency(amount, from, to, rates) {
  if (from === to) return amount
  if (!rates[to] || !rates[from]) return null

  // (ojo) si la base de rates es from, conversion directa
  // si no, cruzo por USD
  const baseRate = rates[from] || 1
  const targetRate = rates[to]
  return (amount / baseRate) * targetRate
}

/**
 * formateo un monto con el simbolo de la moneda
 */
export function formatCurrency(amount, currencyCode) {
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2
    }).format(amount)
  } catch {
    return `${currencyCode} ${amount?.toFixed(2)}`
  }
}

/** lista de monedas mas comunes para el proyecto */
export const COMMON_CURRENCIES = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  { code: 'JPY', name: 'Yen Japonés', symbol: '¥' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'CA$' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'Fr' },
  { code: 'CNY', name: 'Yuan Chino', symbol: '¥' },
  { code: 'INR', name: 'Rupia India', symbol: '₹' },
  { code: 'THB', name: 'Baht Tailandés', symbol: '฿' },
  { code: 'TRY', name: 'Lira Turca', symbol: '₺' }
]
