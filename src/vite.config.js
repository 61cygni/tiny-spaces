import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@games': path.resolve(__dirname, './games'),
      '@spaced': path.resolve(__dirname, './spaced'),
      '@ps1': path.resolve(__dirname, './games/ps1'),
    }
  }
})