import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// OscarSpa — dev server on http://localhost:5173
export default defineConfig({
  // Göreli yollar: uygulamanın hangi statik host'ta veya alt yolda
  // yayınlandığından bağımsız çalışmasını sağlar.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: false,
  },
})
