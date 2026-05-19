<!--
  muestra datos geograficos y demograficos obtenidos de RestCountries
-->
<template>
  <div class="country-info card">
    <div class="country-header">
      <img
        v-if="country.flag"
        :src="country.flag"
        :alt="country.flagAlt || `Bandera de ${country.name}`"
        class="flag"
      />
      <div class="country-names">
        <h2 class="display-title country-title">{{ country.name }}</h2>
        <p class="country-official">{{ country.officialName }}</p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">🏛️ Capital</span>
        <span class="info-value">{{ country.capital }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">🌍 Región</span>
        <span class="info-value">{{ country.region }} — {{ country.subregion }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">👥 Población</span>
        <span class="info-value">{{ formatPopulation(country.population) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">🗣️ Idiomas</span>
        <span class="info-value">{{ country.languages?.join(', ') || 'N/D' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">💰 Moneda</span>
        <span class="info-value">
          <span v-for="c in country.currencies" :key="c.code" class="currency-tag">
            {{ c.name }} ({{ c.symbol }} · {{ c.code }})
          </span>
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">🕐 Zona horaria</span>
        <span class="info-value">{{ country.timezones?.[0] || 'N/D' }}</span>
      </div>
      <div v-if="country.area" class="info-item">
        <span class="info-label">📐 Área</span>
        <span class="info-value">{{ formatArea(country.area) }} km²</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPopulation } from '@/services/countriesService.js'

defineProps({
  country: { type: Object, required: true }
})

function formatArea(area) {
  return new Intl.NumberFormat('es').format(Math.round(area))
}
</script>

<style scoped>
.country-info { padding: 28px; }

.country-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.flag {
  width: 80px;
  height: auto;
  border-radius: 6px;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.country-title { font-size: 32px; line-height: 1.1; }
.country-official {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-top: 4px;
  font-style: italic;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.info-value {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.currency-tag {
  display: block;
  color: var(--color-accent);
}
</style>
