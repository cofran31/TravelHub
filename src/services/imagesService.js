import { unsplashClient } from './httpClient.js'
import { getCache, setCache, TTL } from '@/utils/cache.js'
/** 
 * Unsplash tiene el problema que las imagenes expiran, se almacenaran
 * solo por 1 hora para evitar problemas
 * **/

/**
 * obtengo imagenes del destino desde Unsplash.
 */
export async function getDestinationImages(query, count = 12) {
  const cacheKey = `images_${query.toLowerCase().replace(/\s+/g, '_')}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  // Fallback: si no hay API key configurada usamos imágenes de Unsplash Source
  const apiKey = import.meta.env.VITE_UNSPLASH_KEY
  if (!apiKey || apiKey === 'YOUR_UNSPLASH_ACCESS_KEY') {
    return getFallbackImages(query, count)
  }

  const { data } = await unsplashClient.get('/search/photos', {
    params: {
      query: `${query} travel landscape`,
      per_page: count,
      orientation: 'landscape',
      content_filter: 'high'
    }
  })

  const result = data.results.map(photo => ({
    id: photo.id,
    url: photo.urls.regular,
    urlSmall: photo.urls.small,
    urlFull: photo.urls.full,
    alt: photo.alt_description || query,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    color: photo.color,
    width: photo.width,
    height: photo.height
  }))

  setCache(cacheKey, result, TTL.IMAGES)
  return result
}

/**
* prueba sin Api key
 */
function getFallbackImages(query, count) {
  const encoded = encodeURIComponent(query)
  return Array.from({ length: count }, (_, i) => ({
    id: `fallback_${i}`,
    url: `https://source.unsplash.com/800x600/?${encoded}&sig=${i}`,
    urlSmall: `https://source.unsplash.com/400x300/?${encoded}&sig=${i}`,
    alt: query,
    photographer: 'Unsplash',
    photographerUrl: 'https://unsplash.com',
    color: '#1a1d28'
  }))
}