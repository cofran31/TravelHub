<!--
  API: Unsplash — imagenes dinamicas de alta calidad
-->
<template>
  <div class="gallery-panel card">
    <div class="panel-header">
      <h3 class="panel-title display-title">Galería de {{ title }}</h3>
      <div class="badge">Unsplash</div>
    </div>

    <!-- Imagen destacada -->
    <div
      v-if="selectedImage"
      class="gallery-featured"
      @click="selectedImage = null"
    >
      <img
        :src="selectedImage.url"
        :alt="selectedImage.alt"
        class="featured-img"
      />
      <div class="featured-overlay">
        <span class="featured-credit">
          📷 {{ selectedImage.photographer }}
        </span>
        <button class="featured-close">✕</button>
      </div>
    </div>

    <!-- Grid de imágenes -->
    <div class="gallery-grid" :class="{ 'gallery-hidden': selectedImage }">
      <div
        v-for="(img, i) in images"
        :key="img.id"
        class="gallery-item"
        :style="{ '--img-color': img.color, '--delay': `${i * 0.05}s` }"
        @click="selectedImage = img"
      >
        <img
          :src="img.urlSmall || img.url"
          :alt="img.alt"
          class="gallery-img"
          loading="lazy"
        />
        <div class="gallery-hover">
          <span class="gallery-photographer">📷 {{ img.photographer }}</span>
        </div>
      </div>
    </div>

    <p v-if="!images?.length" class="state-empty">
      No se encontraron imágenes para este destino.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  images: { type: Array, default: () => [] },
  title: { type: String, default: 'destino' }
})

const selectedImage = ref(null)
</script>

<style scoped>
.gallery-panel { padding: 28px; }

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.panel-title { font-size: 22px; }

/* Imagen destacada (lightbox simple) */
.gallery-featured {
  position: relative;
  margin-bottom: 16px;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  max-height: 400px;
}
.featured-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}
.featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.featured-credit {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}
.featured-close {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}
.gallery-hidden { display: none; }

.gallery-item {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4/3;
  background: var(--img-color, var(--color-bg-2));
  animation: fadeIn 0.4s ease var(--delay) both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.gallery-item:hover .gallery-img {
  transform: scale(1.06);
}

.gallery-hover {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}
.gallery-item:hover .gallery-hover {
  opacity: 1;
}
.gallery-photographer {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  line-height: 1.3;
}
</style>
