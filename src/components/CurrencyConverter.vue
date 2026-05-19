<!--
  API: ExchangeRate-API )
-->
<template>
  <div class="converter card">
    <div class="panel-header">
      <h3 class="panel-title display-title">Conversor de Divisas</h3>
      <div class="badge">{{ exchange.base }} base</div>
    </div>

    <div class="converter-form">
      <!-- Monto -->
      <div class="field">
        <label class="field-label">Monto</label>
        <input
          v-model.number="amount"
          type="number"
          class="input"
          min="0"
          step="0.01"
          placeholder="100"
        />
      </div>

      <!-- Moneda origen -->
      <div class="field">
        <label class="field-label">De</label>
        <select v-model="fromCurrency" class="input">
          <option
            v-for="c in availableCurrencies"
            :key="c.code"
            :value="c.code"
          >
            {{ c.code }} — {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Botón invertir -->
      <button class="btn btn-secondary swap-btn" @click="swapCurrencies" title="Invertir">
        ⇄
      </button>

      <!-- Moneda destino -->
      <div class="field">
        <label class="field-label">A</label>
        <select v-model="toCurrency" class="input">
          <option
            v-for="c in availableCurrencies"
            :key="c.code"
            :value="c.code"
          >
            {{ c.code }} — {{ c.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Resultado -->
    <div v-if="result !== null" class="result">
      <div class="result-from">
        {{ formatCurrency(amount, fromCurrency) }}
      </div>
      <div class="result-arrow">→</div>
      <div class="result-to">
        {{ formatCurrency(result, toCurrency) }}
      </div>
    </div>

    <!-- Tasa actual -->
    <div v-if="rate" class="rate-info">
      <span class="rate-label">Tasa:</span>
      1 {{ fromCurrency }} = {{ rate.toFixed(4) }} {{ toCurrency }}
    </div>

    <!-- Tabla de tasas comunes -->
    <div class="divider"></div>
    <div class="rates-table">
      <h4 class="rates-title">Tasas desde {{ exchange.base }}</h4>
      <div class="rates-grid">
        <div
          v-for="c in topCurrencies"
          :key="c"
          class="rate-row"
          @click="toCurrency = c"
          :class="{ active: toCurrency === c }"
        >
          <span class="rate-code">{{ c }}</span>
          <span class="rate-value">{{ formatRate(exchange.rates[c]) }}</span>
        </div>
      </div>
    </div>

    <p class="rates-note">
      Actualizado: {{ exchange.date ? new Date(exchange.date).toLocaleDateString('es') : 'N/D' }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { convertCurrency, formatCurrency, COMMON_CURRENCIES } from '@/services/exchangeService.js'

const props = defineProps({
  exchange: { type: Object, required: true },
  // Moneda local del destino para precargar
  destinationCurrency: { type: String, default: 'EUR' }
})

const amount = ref(100)
const fromCurrency = ref('USD')
const toCurrency = ref(props.destinationCurrency || 'EUR')

// Solo mostramos las monedas disponibles en las tasas
const availableCurrencies = computed(() => {
  const available = new Set(Object.keys(props.exchange.rates || {}))
  return COMMON_CURRENCIES.filter(c => available.has(c.code))
})

const result = computed(() => {
  if (!amount.value || amount.value <= 0) return null
  return convertCurrency(amount.value, fromCurrency.value, toCurrency.value, props.exchange.rates)
})

const rate = computed(() => {
  if (!props.exchange.rates) return null
  return convertCurrency(1, fromCurrency.value, toCurrency.value, props.exchange.rates)
})

const topCurrencies = computed(() => {
  const preferred = ['USD', 'EUR', 'GBP', 'JPY', 'BOB', 'BRL', 'COP', 'MXN', 'ARS', 'PEN', 'CAD', 'AUD', 'CHF']
  return preferred.filter(c => props.exchange.rates?.[c])
})

function swapCurrencies() {
  ;[fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value]
}

function formatRate(rate) {
  if (!rate) return '—'
  return rate >= 1000
    ? new Intl.NumberFormat('es', { maximumFractionDigits: 0 }).format(rate)
    : new Intl.NumberFormat('es', { maximumFractionDigits: 4 }).format(rate)
}
</script>

<style scoped>
.converter { padding: 28px; }

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.panel-title { font-size: 22px; }

.converter-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto 1fr;
  gap: 12px;
  align-items: end;
  margin-bottom: 20px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.swap-btn {
  height: 42px;
  font-size: 18px;
  padding: 0 12px;
  align-self: end;
}

/* Resultado */
.result {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-2);
  border-radius: var(--radius);
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.result-from {
  font-size: 18px;
  color: var(--color-text-muted);
}
.result-arrow {
  color: var(--color-accent);
  font-size: 20px;
}
.result-to {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 300;
  color: var(--color-accent);
}

.rate-info {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 0;
}
.rate-label { font-weight: 500; }

/* Tabla de tasas */
.rates-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
}

.rate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}
.rate-row:hover { border-color: var(--color-accent); }
.rate-row.active {
  border-color: var(--color-accent);
  background: var(--color-accent-glow);
  color: var(--color-accent);
}

.rate-code { font-weight: 500; }
.rate-value { color: var(--color-text-muted); font-size: 11px; }
.rate-row.active .rate-value { color: var(--color-accent); }

.rates-note {
  font-size: 11px;
  color: var(--color-text-dim);
  margin-top: 12px;
}

@media (max-width: 600px) {
  .converter-form {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
  }
  .field:first-child { grid-column: 1 / -1; }
  .swap-btn { grid-column: 1 / -1; justify-self: center; }
}
</style>
