import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './state/store.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Appointments from './pages/Appointments.jsx'
import SpaFloor from './pages/SpaFloor.jsx'
import Guests from './pages/Guests.jsx'
import Therapists from './pages/Therapists.jsx'
import Services from './pages/Services.jsx'
import Packages from './pages/Packages.jsx'
import Sales from './pages/Sales.jsx'
import Inventory from './pages/Inventory.jsx'
import Finance from './pages/Finance.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const { user } = useStore()
  if (!user) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/randevular" element={<Appointments />} />
        <Route path="/spa-floor" element={<SpaFloor />} />
        <Route path="/misafirler" element={<Guests />} />
        <Route path="/terapistler" element={<Therapists />} />
        <Route path="/hizmetler" element={<Services />} />
        <Route path="/paketler" element={<Packages />} />
        <Route path="/satis" element={<Sales />} />
        <Route path="/stok" element={<Inventory />} />
        <Route path="/finans" element={<Finance />} />
        <Route path="/raporlar" element={<Reports />} />
        <Route path="/ayarlar" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
