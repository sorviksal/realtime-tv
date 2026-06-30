import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress noisy third-party annotation warnings (e.g. @microsoft/signalr)
        if (warning.code === 'INVALID_ANNOTATION') return
        warn(warning)
      }
    }
  }
})