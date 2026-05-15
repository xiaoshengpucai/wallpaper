import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: true, // 这一行必须有！
    cors:true,
    host: "0.0.0.0",     // 加上这一行！强制允许外网访问
    port: 5173,          // 固定端口 5173
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
  },
})

