import { reactive, readonly } from 'vue'
/**
 * todos los módulos (clima, imagenes, divisas) reaccionan automaticamente
 * cuando el usuario cambia el destino en el explorador. 
 */
const estado = reactive({
  /** pais seleccionado (objeto completo de RestCountries) */
  pais: null,
  /** nombre de busqueda actual */
  nombreBusqueda: '',
  /** si se esta cargando un destino */
  cargando: false,
})

export function useDestino() {
  /**
   * Establece el país activo.
   * @param {Object} pais - objeto de RestCountries
   */
  function seleccionarPais(pais) {
    estado.pais = pais
  }

  function setBusqueda(nombre) {
    estado.nombreBusqueda = nombre
  }

  function setCargando(val) {
    estado.cargando = val
  }

  function limpiar() {
    estado.pais = null
    estado.nombreBusqueda = ''
  }

  return {
    destino: readonly(estado),
    seleccionarPais,
    setBusqueda,
    setCargando,
    limpiar,
  }
}
