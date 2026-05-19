<!--
  API: Open-Meteo (sin key) — Pronóstico extendido 7 días
-->
<template>
  <div class="weather-panel card">
    <div class="panel-header">
      <h3 class="panel-title display-title">Clima en {{ weather.location }}</h3>
      <div class="badge">Open-Meteo</div>
    </div>

    <!-- clima actual -->
    <div class="current-weather">
      <div class="current-main">
        <span class="current-emoji">{{ currentInfo.emoji }}</span>
        <div>
          <div class="current-temp">{{ weather.current.temp }}°C</div>
          <div class="current-desc">{{ currentInfo.text }}</div>
        </div>
      </div>
      <div class="current-detail">
        <span>💨 {{ weather.current.windspeed }} km/h</span>
        <span>{{ weather.current.isDay ? '☀️ Día' : '🌙 Noche' }}</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- pronostico 7 dias -->
    <div class="forecast">
      <h4 class="forecast-title">Próximos 7 días</h4>
      <div class="forecast-grid">
        <div
          v-for="day in weather.daily"
          :key="day.date"
          class="forecast-day"
        >
          <div class="day-name">{{ formatDay(day.date) }}</div>
          <div class="day-emoji">{{ interpretWeatherCode(day.weathercode).emoji }}</div>
          <div class="day-temps">
            <span class="temp-max">{{ day.tempMax }}°</span>
            <span class="temp-min">{{ day.tempMin }}°</span>
          </div>
          <div v-if="day.precipitation > 0" class="day-rain">
            💧 {{ day.precipitation }}mm
          </div>
        </div>
      </div>
    </div>

    <!-- recomendacion de viaje -->
    <div v-if="recommendation" class="recommendation">
      <div class="divider"></div>
      <div class="rec-header">
        <h4 class="rec-title">🧳 Qué empacar</h4>
        <div class="badge">{{ recommendation.rating }}</div>
      </div>
      <p class="rec-advice">{{ recommendation.advice }}</p>
      <div class="rec-items">
        <div v-for="item in recommendation.items" :key="item" class="rec-item">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { interpretWeatherCode, getTravelRecommendation } from '@/services/weatherService.js'

const props = defineProps({
  weather: { type: Object, required: true }
})

const currentInfo = computed(() =>
  interpretWeatherCode(props.weather.current.weathercode)
)

const recommendation = computed(() =>
  getTravelRecommendation(props.weather)
)

function formatDay(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric' }).format(date)
}
</script>

<style scoped>
.weather-panel { padding: 28px; }

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.panel-title { font-size: 22px; }

/* Clima actual */
.current-weather {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.current-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-emoji { font-size: 48px; }

.current-temp {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 300;
  line-height: 1;
  color: var(--color-accent);
}

.current-desc {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-top: 4px;
}

.current-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Pronóstico */
.forecast-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.forecast-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-2);
  font-size: 11px;
  text-align: center;
}

.day-name { color: var(--color-text-muted); text-transform: capitalize; }
.day-emoji { font-size: 20px; }
.day-temps { display: flex; gap: 4px; }
.temp-max { color: var(--color-text); font-weight: 500; }
.temp-min { color: var(--color-text-muted); }
.day-rain { color: var(--color-accent-2); font-size: 10px; }

/* Recomendación */
.rec-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.rec-title {
  font-size: 14px;
  font-weight: 500;
}
.rec-advice {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 16px;
}
.rec-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.rec-item {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 600px) {
  .forecast-grid { grid-template-columns: repeat(4, 1fr); }
  .forecast-day:nth-child(n+5) { display: none; }
}
</style>
