import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@spaced': path.resolve(__dirname, '../../spaced'),
    }
  },
  build: {
    target: 'esnext',
    modulePreload: true,
    minify: true,
  }
})