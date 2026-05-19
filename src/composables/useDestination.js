import { ref, computed } from 'vue'
import { loadDestinationData } from '@/services/destinationService.js'
import { getTravelRecommendation, interpretWeatherCode } from '@/services/weatherService.js'
import { convertCurrency, formatCurrency } from '@/services/exchangeService.js'

export function useDestination() {
  // Estado reactivo
  const isLoading  = ref(false)
  const error      = ref(null)
  const country    = ref(null)
  const weather    = ref(null)
  const images     = ref([])
  const exchange   = ref(null)
  const apiErrors  = ref({})

  // computed: recomendación de viaje basada en el clima
  const recommendation = computed(() =>
    weather.value ? getTravelRecommendation(weather.value) : null
  )

  // computed: estado del clima actual con emoji
  const currentWeather = computed(() => {
    if (!weather.value?.current) return null
    return {
      ...weather.value.current,
      ...interpretWeatherCode(weather.value.current.weathercode)
    }
  })

  /**
   * cargo todos los datos del destino
   * @param {string} countryName
   */
  async function loadDestination(countryName) {
    isLoading.value  = true
    error.value      = null
    country.value    = null
    weather.value    = null
    images.value     = []
    exchange.value   = null
    apiErrors.value  = {}

    try {
      const data = await loadDestinationData(countryName)
      country.value   = data.country
      weather.value   = data.weather
      images.value    = data.images || []
      exchange.value  = data.exchange
      apiErrors.value = data.errors || {}
    } catch (err) {
      error.value = err.message || 'Error al cargar el destino'
    } finally {
      isLoading.value = false
    }
  }

  /** convierto un monto usando las tasas cargadas */
  function convert(amount, fromCurrency, toCurrency) {
    if (!exchange.value?.rates) return null
    return convertCurrency(amount, fromCurrency, toCurrency, exchange.value.rates)
  }

  /** formatea monto con símbolo de moneda */
  function format(amount, currencyCode) {
    return formatCurrency(amount, currencyCode)
  }

  return {
    isLoading, error, country, weather, images, exchange,
    apiErrors, recommendation, currentWeather,
    loadDestination, convert, format
  }
}