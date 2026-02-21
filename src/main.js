import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

import { useThemeStore } from './stores/theme'
import { useI18nStore } from './stores/i18n'

const themeStore = useThemeStore()
const i18nStore = useI18nStore()

// Инициализируем i18n
i18nStore.init()

app.mount('#app')
