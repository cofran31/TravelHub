import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)

// Pinia: store reactivo global para estado compartido entre componentes
app.use(createPinia())
app.use(router)

app.mount('#app')
