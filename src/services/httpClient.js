/**
 se crea el servicio que todos los demás servicios usarán para hacer peticiones HTTP.
*/
import axios from 'axios'

/**
 * se crea una instancia de axios con configuracion base.
 */
export function createApiClient(baseURL, defaultHeaders = {}) {
  const instance = axios.create({
    baseURL,
    timeout: 10000, // 10 segundos antes de abortar la petición
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders
    }
  })

  // interceptor de REQUEST 
  // Se ejecuta antes de cada peticion
  // logs de desarrollo o modificar parametros globalmente
  instance.interceptors.request.use(
    (config) => {
      if (import.meta.env.DEV) {
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // interceptor de RESPONSE 
  // normaliza errores para que todos los componentes reciban
  // un objeto de error consistente: { message, status, original }
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalizedError = {
        message: error.response?.data?.message
          || error.response?.statusText
          || error.message
          || 'Error desconocido',
        status: error.response?.status || 0,
        original: error
      }
      return Promise.reject(normalizedError)
    }
  )

  return instance
}

// instancias de APIs utilizadas ──────────────────────────────

/** RestCountries (información geografica y demografica de paises) */
export const countriesClient = createApiClient('https://restcountries.com/v3.1')

/** Open-Meteo (pronostico del tiempo (sin API key requerida)) */
export const weatherClient = createApiClient('https://api.open-meteo.com/v1')

/** Open-Meteo Geocoding (coordenadas a partir de nombre de ciudad)*/
export const geocodingClient = createApiClient('https://geocoding-api.open-meteo.com/v1')

/**
Unsplash (imagenes de alta calidad, solo 50 request por hora)
Paso el valor desde la la variable .env
*/
export const unsplashClient = createApiClient('https://api.unsplash.com', {
  Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_KEY || 'YOUR_UNSPLASH_ACCESS_KEY'}`
})

/**
 * ExchangeRate-API (tasas de cambio actualizadas, solo 1500 request por mes)
 * Paso el valor desde la la variable .env
 */
export const exchangeClient = createApiClient(
  `https://v6.exchangerate-api.com/v6/${import.meta.env.VITE_EXCHANGE_KEY || 'YOUR_EXCHANGE_KEY'}`
)
