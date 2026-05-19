/*
Implemento cache sobre localStore con TTL manual para evitar dependencias externas y mantener persistencia entre sesiones. Cada entrada se guarda como JSON con la estructura { data, expiresAt }. Las funciones principales son setCache (para guardar), getCache (para recuperar si no ha expirado), clearCache (para eliminar una entrada) y clearAllCache (para limpiar todo el caché de TravelHub). Además, defino TTL recomendados por tipo de dato para facilitar su uso en toda la aplicación.
*/
const PREFIX = 'travelhub_cache_'

/** Guardo un valor en caché con TTL (por defecto 5 minutos) */
export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, expiresAt: Date.now() + ttlMs }))
  } catch (e) {
    console.warn('[Cache] Error al guardar:', key, e)
  }
}

/** Recupera un valor si no ha expirado, o null */
export function getCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw)
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return entry.data
  } catch (e) {
    return null
  }
}

/** Elimina una entrada del caché */
export function clearCache(key) {
  localStorage.removeItem(PREFIX + key)
}

/** Limpia todo el caché de TravelHub */
export function clearAllCache() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k))
}

/** TTL recomendados por tipo de dato */
export const TTL = {
  COUNTRIES: 24 * 60 * 60 * 1000, // 24h — datos estáticos
  WEATHER:   30 * 60 * 1000,       // 30min — cambia frecuente
  IMAGES:    60 * 60 * 1000,       // 1h — URLs estables
  EXCHANGE:  60 * 60 * 1000        // 1h — actualización diaria
}