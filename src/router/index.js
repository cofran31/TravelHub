import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'TravelHub — Inicio' }
  },
  {
    path: '/destino/:country',
    name: 'Destino',
    component: () => import('@/views/DestinoView.vue'),
    meta: { title: 'Explorar Destino' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' })
})

// Actualizar título de la pestaña en cada navegación
router.afterEach((to) => {
  document.title = to.meta.title || 'TravelHub'
})

export default router
