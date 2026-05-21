# <center>Documentación Técnica</center>

<center>Proyecto Final - TravelHub </center>

## Maestrante: Juan Carlos Ortube Lahor
* <a href="https://cofran31.github.io/travel/" target="_blank" rel="noopener noreferrer">DEMO FUNCIONAL  [🔗]</a>
##
 ## Objetivo General
Desarrollar una aplicación web funcional que integre **al menos 4 APIs externas distintas**, demuestre dominio de patrones avanzados de consumo de APIs y ofrezca una experiencia de usuario coherente y profesional. 

## 1 Diagrama de Arquitectura
![Arquitectura](https://cofran31.github.io/travel/screenshots/diagrama_arquitectura.png)
  

## 2 Tabla de APIs Utilizadas

 | API | URL Base | Autenticación | Endpoints Consumidos | Limitaciones |
| :--- | :---: | ---: | ---: | ---: | 
|**RestCountries** |`https://restcountries.com/v3.1` | Ninguna | `/translation/{name}`,  `/capital/{name}`,`/alpha/{cca2}` | Sin límite oficial |
|**Open-Meteo**|`https://api.open-meteo.com/v1` | Ninguna | `/forecast` | 10,000 req/día |
|**Open-Meteo Geocoding** |`https://geocoding-api.open-meteo.com/v1` | Ninguna | `/search` | Incluida en Open-Meteo |
|**Unsplash**|`https://api.unsplash.com` | `Client-ID` (header) | `/search/photos` | 50 req/hora (free) |
|**ExchangeRate-API** | `https://v6.exchangerate-api.com/v6/{key}` | API Key en URL |`/latest/{currency}` | 1500 req/mes (free) |
|**Frankfurter** (fallback) |`https://api.frankfurter.app` | Ninguna | `/latest` | Sin límite publicado | 

## 3 Decisiones Técnicas

  

### Framework: Vue 3 + Composition API

Se eligió Vue 3 con `<script setup>` y Composition API porque:

- La Composition API permite agrupar lógica relacionada en composables reutilizables (`useDestination`).

-  `<script setup>` reduce el boilerplate significativamente.

- Reactividad granular con `ref` y `computed`.

  

### Servicio HTTP: Axios con interceptores centralizados (`httpClient.js`)

Se usa Axios en lugar de Fetch nativo porque:

- Los interceptores permiten logging, normalización de errores y tokens en un solo lugar.

- Fetch no rechaza la promesa en errores HTTP (4xx/5xx); Axios sí lo hace por defecto.

- Cancelación y timeouts más simples de configurar.

- Cada API tiene su propia instancia (`createApiClient`) con baseURL y headers separados.

  

### Estrategia de Caché: localStorage con TTL manual (`cache.js`)

Se implementó un caché manual sobre localStorage con TTL configurable porque:

- Persiste entre sesiones (a diferencia de memoria o sessionStorage).

- TTL diferenciado por tipo de dato: países (24h), clima (30min), imágenes (1h), divisas (1h).

- No agrega dependencias externas (vs React Query o SWR).

- Simple.

  

### Llamadas Dependientes (`weatherService.js`)

El flujo de clima requiere dos llamadas en secuencia:

1.  `geocodingClient.get('/search', { name: cityName })` → obtiene coordenadas.

2.  `weatherClient.get('/forecast', { latitude, longitude })` → usa esas coordenadas.

  

La segunda llamada **no puede ejecutarse** sin el resultado de la primera. Esto es una dependencia real, no de diseño.

  

### Concurrencia: `Promise.allSettled` (`destinationService.js`)

Se eligió `Promise.allSettled` sobre `Promise.all` porque:

-  `Promise.all` cancela todo si una petición falla (p.ej.: Unsplash sin key)

-  `Promise.allSettled` permite que los módulos disponibles se muestren aunque otros fallen

- Mejora la resiliencia: el usuario puede ver clima aunque las imágenes fallen

- Cada resultado tiene `{ status: 'fulfilled'|'rejected', value|reason }`

  

## 4 Desafíos y Soluciones

  

### 4.1. Unsplash sin API Key en desarrollo

**Problema**: Unsplash requiere clave de desarrollador; en desarrollo no siempre está disponible.

**Solución**: Se implementó un fallback a `Unsplash Source` (servicio sin autenticación) que genera URLs de imágenes aleatorias por query. La función `getFallbackImages` se activa automáticamente cuando `VITE_UNSPLASH_KEY` no está configurada.

  

### 4.2. ExchangeRate-API con cuota limitada

**Problema**: El plan gratuito tiene 1500 req/mes, fácil de agotar en desarrollo.

**Solución**: Doble estrategia: (a) caché agresivo de 1 hora en localStorage, y (b) fallback automático a Frankfurter.app (datos del Banco Central Europeo, sin autenticación, sin límite publicado). El interceptor de errores de Axios detecta el fallo y redirige transparentemente.

  

### 4.3. Open-Meteo no acepta nombres de ciudad directamente

**Problema**: La API de pronóstico solo acepta coordenadas (lat/lon), no nombres.

**Solución**: Se implementó una llamada dependiente usando la API de Geocodificación de Open-Meteo, que convierte el nombre de la capital (obtenido de RestCountries) en coordenadas. Si el país ya tiene `latlng` en RestCountries, se usan directamente para evitar la llamada de geocodificación.

  

### 4.4. `Promise.allSettled` requiere manejo explícito de errores parciales

**Problema**: A diferencia de `Promise.all`, `allSettled` no lanza excepciones; los errores están en `result.reason`.

**Solución**: En `destinationService.js` se itera sobre cada resultado, se extrae `value` o se registra el error en el objeto `errors`, que se propaga a los componentes para mostrar mensajes específicos por módulo sin bloquear los demás.

###  4.5. **RestCountries manejo de paises y capitales**
 **Problema**: Usando el api de RestCountries solo tiene endpoints específicos de paisa y capitales, además que el uso de idioma en los nombres de búsqueda.

**Solución**: En `searchCountries.js` se valida el resultado primeramente de pais en caso que no tenga resultados y se produce un error se hace una excepcion para que busque por capital, adicionalmente para el idioma se usa el endpoint de `/translation/{name}`, para distinguir diferentes idiomas.

## 5 Instrucciones de Instalación y Ejecución

  

### Prerrequisitos

- Node.js 18+ ([descargar](https://nodejs.org))

- npm 9+ (incluido con Node.js)

  

### 1. Instalar dependencias

```bash
git clone https://github.com/cofran31/TravelHub.git

cd  travelhub

npm  install

```

  

### 2. Configurar variables de entorno

```bash

cp  .env.example  .env

```

Edita `.env` y agrega tus claves:

-  `VITE_UNSPLASH_KEY`: obtén gratis en https://unsplash.com/developers

-  `VITE_EXCHANGE_KEY`: obtén gratis en https://www.exchangerate-api.com

    

### 3. Ejecutar en desarrollo

```bash

npm  run  dev

```

Abre http://localhost:5173 en tu navegador.

  

### 4. Construir para producción

```bash
npm  run  build  # genera dist/

npm  run  preview  # previsualiza el build
```
## 5 Conclusiones
Se logra realizar en su totalidad el proyecto TravelHub que permite realizar búsquedas por paises y ciudades capitales y mostrar el clima (sugerencia de vestimenta), conversor de divisas, y galeria de imagenes de cada busqueda, se logra realizar todo lo solicitado en el documento de trabajo, usando el framework VUE con VITE resulta una manera sencilla de realizar aplicaciones SPA y juntamente el uso de cache permite una aplicacion muy rapida y versatil.

### Screenshots

![home](https://cofran31.github.io/travel/screenshots/1_home.png)
![busqueda](https://cofran31.github.io/travel/screenshots/2_busqueda.png)
![loading](https://cofran31.github.io/travel/screenshots/3_loading_busqueda.png)
![resultado](https://cofran31.github.io/travel/screenshots/4_resultado_busqueda.png)
![informacion_pais](https://cofran31.github.io/travel/screenshots/5_informacion_pais.png)
![clima_pais](https://cofran31.github.io/travel/screenshots/6_clima_pais.png)
![tasa_cambio](https://cofran31.github.io/travel/screenshots/7_tasa_cambio_pais.png)
![imagenes_pais](https://cofran31.github.io/travel/screenshots/8_imagenes_pais.png)

