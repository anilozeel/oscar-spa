import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './state/store.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import ForcePwChange from './pages/ForcePwChange.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Appointments from './pages/Appointments.jsx'
import MyCommissions from './pages/MyCommissions.jsx'
import Guests from './pages/Guests.jsx'
import Therapists from './pages/Therapists.jsx'
import Services from './pages/Services.jsx'
import Packages from './pages/Packages.jsx'
import Sales from './pages/Sales.jsx'
import Finance from './pages/Finance.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

// Rol yetkisi olmayan sayfaya URL ile erişimi engeller (ör. terapist -> /finans)
function Guarded({ k, children }) {
  const { canAccess } = useStore()
  return canAccess(k) ? children : <Navigate to="/" replace />
}

// Ana sayfa: Dashboard parayı/ciroyu gösterir. Dashboard yetkisi olmayan rol
// (ör. Resepsiyon) ilk erişilebilir sayfaya yönlendirilir — parayı hiç görmez.
const HOME_ORDER = [
  ['appointments', '/randevular'], ['guests', '/misafirler'], ['services', '/hizmetler'],
  ['packages', '/paketler'], ['sales', '/satis'], ['finance', '/finans'],
  ['reports', '/raporlar'], ['mycommissions', '/primlerim'], ['settings', '/ayarlar'],
]
function Home() {
  const { canAccess } = useStore()
  if (canAccess('dashboard')) return <Dashboard />
  const first = HOME_ORDER.find(([k]) => canAccess(k))
  return <Navigate to={first ? first[1] : '/randevular'} replace />
}

export default function App() {
  const { user, toast, sidebarOpen, setSidebarOpen } = useStore()
  const backRef = useRef({ lastBack: 0, sidebarOpen, setSidebarOpen })
  backRef.current.sidebarOpen = sidebarOpen
  backRef.current.setSidebarOpen = setSidebarOpen

  // Android donanım geri tuşu: açık menüyü kapat → önceki ekran → kökte çift dokunuşla çıkış
  useEffect(() => {
    let sub
    let cancelled = false
    ;(async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return
        const { App: CapApp } = await import('@capacitor/app')
        sub = await CapApp.addListener('backButton', ({ canGoBack }) => {
          const s = backRef.current
          if (s.sidebarOpen) { s.setSidebarOpen(false); return }   // önce açık menüyü kapat
          if (canGoBack) { window.history.back(); return }         // önceki ekrana dön
          const now = Date.now()                                    // kök ekran: çift dokunuşla çık
          if (now - s.lastBack < 2000) CapApp.exitApp()
          else { s.lastBack = now; toast('Çıkmak için tekrar geri tuşuna basın') }
        })
        if (cancelled && sub) sub.remove()
      } catch { /* web: donanım geri tuşu yok */ }
    })()
    return () => { cancelled = true; if (sub) sub.remove() }
  }, [toast])

  if (!user) return <Login />
  if (user.needPwChange) return <ForcePwChange />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/randevular" element={<Guarded k="appointments"><Appointments /></Guarded>} />
        <Route path="/primlerim" element={<Guarded k="mycommissions"><MyCommissions /></Guarded>} />
        <Route path="/misafirler" element={<Guarded k="guests"><Guests /></Guarded>} />
        <Route path="/terapistler" element={<Guarded k="therapists"><Therapists /></Guarded>} />
        <Route path="/hizmetler" element={<Guarded k="services"><Services /></Guarded>} />
        <Route path="/paketler" element={<Guarded k="packages"><Packages /></Guarded>} />
        <Route path="/satis" element={<Guarded k="sales"><Sales /></Guarded>} />
        <Route path="/finans" element={<Guarded k="finance"><Finance /></Guarded>} />
        <Route path="/raporlar" element={<Guarded k="reports"><Reports /></Guarded>} />
        <Route path="/ayarlar" element={<Guarded k="settings"><Settings /></Guarded>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
