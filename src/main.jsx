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
