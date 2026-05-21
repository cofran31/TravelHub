<!--
  DestinoView.vue — Vista principal del destino
  Orquesta todos los módulos: CountryInfo, WeatherPanel, ImageGallery, CurrencyConverter
-->
<template>
  <div class="destino-view">

    <!-- Estado: cargando -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-inner">
        <div class="spinner"></div>
        <p class="loading-text">Explorando <em>{{ currentCountry }}</em>...</p>
        <p class="loading-sub">Cargando clima, imágenes y divisas en paralelo</p>
      </div>
    </div>

    <!-- Estado: error crítico (país no encontrado) -->
    <div v-else-if="error" class="container">
      <div class="state-error" style="padding: 80px 0">
        <div style="font-size: 48px">🗺️</div>
        <h2 style="font-family: var(--font-display); font-size: 28px;">Destino no encontrado</h2>
        <p>{{ error }}</p>
        <RouterLink to="/travel" class="btn btn-primary" style="margin-top: 8px">
          ← Volver al inicio
        </RouterLink>
      </div>
    </div>

    <!-- Contenido cargado -->
    <div v-else-if="country" class="container destino-content">

      <!-- Breadcrumb + título -->
      <div class="destino-header">
        <RouterLink to="/travel" class="back-link">← Inicio</RouterLink>
        <div class="badge">Destino</div>
      </div>

      <!-- MÓDULO 1: Información del país -->
      <section class="module">
        <CountryInfo :country="country" />
      </section>

      <!-- Layout de dos columnas para clima y galería -->
      <div class="modules-grid">

        <!-- MÓDULO 2: Clima -->
        <section class="module">
          <div v-if="weather">
            <WeatherPanel :weather="weather" />
          </div>
          <div v-else-if="apiErrors.weather" class="card">
            <div class="state-error">
              <span>🌡️</span>
              <p>No se pudo cargar el clima</p>
              <p class="error-detail">{{ apiErrors.weather }}</p>
            </div>
          </div>
          <div v-else class="card state-loading">
            <div class="spinner"></div>
            <p>Cargando clima...</p>
          </div>
        </section>

        <!-- MÓDULO 4: Conversor de divisas -->
        <section class="module">
          <div v-if="exchange">
            <CurrencyConverter
              :exchange="exchange"
              :destination-currency="country.currencies?.[0]?.code"
            />
          </div>
          <div v-else-if="apiErrors.exchange" class="card">
            <div class="state-error">
              <span>💱</span>
              <p>No se pudo cargar las divisas</p>
              <p class="error-detail">{{ apiErrors.exchange }}</p>
            </div>
          </div>
          <div v-else class="card state-loading">
            <div class="spinner"></div>
            <p>Cargando divisas...</p>
          </div>
        </section>

      </div>

      <!-- MÓDULO 3: Galería de imágenes (ancho completo) -->
      <section class="module">
        <div v-if="images?.length">
          <ImageGallery :images="images" :title="country.name" />
        </div>
        <div v-else-if="apiErrors.images" class="card">
          <div class="state-error">
            <span>🖼️</span>
            <p>No se pudieron cargar las imágenes</p>
            <p class="error-detail">{{ apiErrors.images }}</p>
          </div>
        </div>
        <div v-else class="card state-loading">
          <div class="spinner"></div>
          <p>Cargando galería...</p>
        </div>
      </section>

    </div>

    <!-- Estado inicial (sin búsqueda aún) -->
    <div v-else class="container">
      <div class="state-empty" style="padding: 80px 0">
        <div style="font-size: 48px">✈️</div>
        <p>Busca un destino para comenzar</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDestination } from '@/composables/useDestination.js'
import CountryInfo from '@/components/CountryInfo.vue'
import WeatherPanel from '@/components/WeatherPanel.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import CurrencyConverter from '@/components/CurrencyConverter.vue'

const route = useRoute()
const currentCountry = ref('')

const {
  isLoading, error, country, weather, images, exchange,
  apiErrors, loadDestination
} = useDestination()

// Carga el destino al montar y cuando cambia la ruta
async function load(name) {
  if (!name) return
  currentCountry.value = name
  await loadDestination(name)
}

onMounted(() => load(route.params.country))
watch(() => route.params.country, load)
</script>

<style scoped>
.destino-view { min-height: 100vh; }

/* Loading overlay de pantalla completa */
.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.loading-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.loading-text {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 300;
}
.loading-text em { color: var(--color-accent); font-style: italic; }
.loading-sub { color: var(--color-text-muted); font-size: 13px; }

/* Contenido */
.destino-content { padding: 32px 24px 64px; }

.destino-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.back-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}
.back-link:hover { color: var(--color-accent); }

.module { margin-bottom: 20px; }

/* Grid de clima + conversor */
.modules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 0;
}

.error-detail {
  font-size: 11px;
  color: var(--color-error);
  opacity: 0.7;
}

@media (max-width: 900px) {
  .modules-grid { grid-template-columns: 1fr; }
}
</style>
