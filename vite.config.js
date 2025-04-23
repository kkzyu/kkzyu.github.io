import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
      'data': '/src/data'
    }
  },
  build: {
    assetsInlineLimit: 4096 // 优化静态资源处理
  }
})