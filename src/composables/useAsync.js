import { ref } from 'vue'

/**
 * 
 * Wrapper reutilizable para cualquier función asíncrona.
 * Centraliza el manejo de: estado de carga, datos, error y respuesta vacía.
 */

export function useAsync(fn) {
  const data = ref(null)
  const cargando = ref(false)
  const error = ref(null)

  async function ejecutar(...args) {
    cargando.value = true
    error.value = null
    data.value = null
    try {
      data.value = await fn(...args)
    } catch (e) {
      error.value = e.message || 'Error inesperado'
    } finally {
      cargando.value = false
    }
  }

  function limpiar() {
    data.value = null
    error.value = null
    cargando.value = false
  }

  return { data, cargando, error, ejecutar, limpiar }
}