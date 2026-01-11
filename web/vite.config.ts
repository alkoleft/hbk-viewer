import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Используем Rolldown для сборки
  build: {
    bundler: 'rolldown',
  },
  experimental: {
    rolldown: true,
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
