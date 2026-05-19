<!--
  HomeView.vue — Pagina principal / Landing de TravelHub
-->
<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
        <div class="hero-grid"></div>
      </div>

      <div class="container hero-content">
        <div class="badge" style="margin-bottom: 24px">Planificador de viajes inteligente</div>
        <h1 class="display-title hero-title">
          Explora el mundo<br>
          <em>sin límites</em>
        </h1>
        <p class="hero-subtitle">
          Clima en tiempo real, conversión de divisas, galería de destinos
          y toda la información geográfica que necesitas — en un solo lugar.
        </p>

        <!-- busqueda principal -->
        <form class="hero-search" @submit.prevent="handleSearch">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              class="input search-input"
              placeholder="¿A dónde quieres ir? (ej: Japón, París, Colombia...)"
              autocomplete="off"
              autofocus
            />
          </div>
          <button type="submit" class="btn btn-primary search-btn" :disabled="!searchQuery.trim()">
            Explorar destino
          </button>
        </form>

        <!-- Destinos populares -->
        <div class="popular">
          <span class="popular-label">Populares:</span>
          <button
            v-for="dest in popularDestinations"
            :key="dest"
            class="btn btn-secondary popular-btn"
            @click="goToDestination(dest)"
          >
            {{ dest }}
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title display-title">Todo lo que necesitas<br><em>para planificar</em></h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <div class="feature-tag badge">{{ feature.api }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const popularDestinations = ['Japón', 'Italia', 'Francia', 'Perú', 'Tailandia', 'Noruega']

const features = [
  {
    icon: '🌍',
    title: 'Explorador de Destinos',
    desc: 'Información geográfica, población, idiomas y moneda local de cualquier país del mundo.',
    api: 'RestCountries API'
  },
  {
    icon: '🌤️',
    title: 'Clima y Recomendaciones',
    desc: 'Pronóstico extendido de 7 días con sugerencias de qué empacar y cuándo viajar.',
    api: 'Open-Meteo API'
  },
  {
    icon: '🖼️',
    title: 'Galería Visual',
    desc: 'Galería de imágenes del destino obtenidas dinámicamente para inspirar tu viaje.',
    api: 'Unsplash API'
  },
  {
    icon: '💱',
    title: 'Conversor de Divisas',
    desc: 'Tasas de cambio actualizadas para convertir entre tu moneda local y la del destino.',
    api: 'ExchangeRate API'
  }
]

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ name: 'Destino', params: { country: q } })
}

function goToDestination(dest) {
  router.push({ name: 'Destino', params: { country: dest } })
}
</script>

<style scoped>
/* ── Hero ── */
.hero {
  position: relative;
  overflow: hidden;
  padding: 100px 0 80px;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
}
.hero-orb-1 {
  width: 600px; height: 600px;
  background: var(--color-accent);
  top: -200px; left: -100px;
}
.hero-orb-2 {
  width: 500px; height: 500px;
  background: var(--color-accent-2);
  bottom: -150px; right: -50px;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--color-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}

.hero-content {
  position: relative;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(48px, 7vw, 96px);
  margin-bottom: 20px;
}
.hero-title em {
  color: var(--color-accent);
  font-style: italic;
}

.hero-subtitle {
  color: var(--color-text-muted);
  font-size: 17px;
  max-width: 520px;
  margin: 0 auto 40px;
  line-height: 1.7;
}

/* Búsqueda */
.hero-search {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto 24px;
}

.search-wrapper {
  flex: 1;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  pointer-events: none;
}
.search-input {
  padding-left: 42px;
  height: 48px;
  font-size: 15px;
}

.search-btn {
  height: 48px;
  padding: 0 28px;
  font-size: 15px;
  flex-shrink: 0;
}

/* Populares */
.popular {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.popular-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-right: 4px;
}
.popular-btn {
  padding: 6px 14px;
  font-size: 12px;
}

/* ── Features ── */
.features {
  padding: 80px 0;
  border-top: 1px solid var(--color-border);
}

.section-title {
  font-size: clamp(32px, 4vw, 56px);
  text-align: center;
  margin-bottom: 48px;
}
.section-title em {
  color: var(--color-accent);
  font-style: italic;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s, border-color 0.2s;
}
.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(232, 168, 124, 0.3);
}

.feature-icon { font-size: 32px; }
.feature-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 400;
}
.feature-desc {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
  flex: 1;
}
.feature-tag { align-self: flex-start; }

@media (max-width: 600px) {
  .hero-search { flex-direction: column; }
  .search-btn { height: 44px; }
}
</style>
