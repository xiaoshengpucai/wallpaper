import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'

import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.errorHandler = (err, instance, info) => {
  // 统一兜底：避免未捕获异常导致白屏；生产环境可上报到 Sentry 等平台
  console.error('[vue:error]', { err, info, instance })
}

app.mount('#app')