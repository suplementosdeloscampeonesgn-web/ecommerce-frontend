import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 5175,
    
    // AÑADE ESTA SECCIÓN
    proxy: {
      // Redirige las peticiones que empiezan con /api a tu backend
      '/api': {
        target: 'http://localhost:8000', // La URL de tu servidor FastAPI
        changeOrigin: true,
      },
    }
  },
  plugins: [
    react(),
    tailwindcss(),
  ]
})