import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './state/store.jsx'
import './styles/index.css'

// HashRouter: her statik sunucuda (GitHub Pages, Netlify, Vercel) ve hatta
// dosyadan açıldığında bile sunucu ayarı gerektirmeden çalışır.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </HashRouter>
  </React.StrictMode>,
)

// PWA: service worker kaydı (ağ öncelikli — çevrimdışı destek + "ana ekrana ekle")
// Yeni sürüm yayınlandığında açık uygulama otomatik yenilenir.
if ('serviceWorker' in navigator) {
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      const checkUpdate = () => { try { reg.update() } catch { /* no-op */ } }
      checkUpdate()
      setInterval(checkUpdate, 60 * 1000)
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate() })
    }).catch(() => {})
  })
}
