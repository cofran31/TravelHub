<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <!-- Logo -->
      <RouterLink to="/" class="logo">
        <span class="logo-icon">✈</span>
        <span class="logo-text">Travel<em>Hub</em></span>
      </RouterLink>

      <!-- Búsqueda rápida -->
      <form class="navbar-search" @submit.prevent="handleSearch">
        <input
          v-model="searchQuery"
          class="input navbar-input"
          placeholder="Buscar destino..."
          autocomplete="off"
        />
        <button type="submit" class="btn btn-primary navbar-btn">
          Explorar
        </button>
      </form>

      <!-- Nav links -->
      <nav class="navbar-links">
        <RouterLink to="/" class="nav-link">Inicio</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ name: 'Destino', params: { country: q } })
  searchQuery.value = ''
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 14, 18, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
}

.navbar-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text);
  flex-shrink: 0;
}

.logo-icon {
  font-size: 20px;
  color: var(--color-accent);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.01em;
}
.logo-text em {
  font-style: italic;
  color: var(--color-accent);
}

.navbar-search {
  flex: 1;
  max-width: 480px;
  display: flex;
  gap: 8px;
}

.navbar-input {
  flex: 1;
  height: 38px;
  padding: 8px 14px;
  font-size: 13px;
}

.navbar-btn {
  height: 38px;
  padding: 0 16px;
  font-size: 13px;
  flex-shrink: 0;
}

.navbar-links {
  margin-left: auto;
  display: flex;
  gap: 20px;
}

.nav-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-accent);
}

@media (max-width: 640px) {
  .navbar-links { display: none; }
  .navbar-search { max-width: none; flex: 1; }
}
</style>
