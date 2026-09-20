import { NavLink } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import Icon from './icons.jsx'

// Mobil alt gezinme çubuğu — rol bazlı ilk 4 bölüm + Menü
const ITEMS = [
  { key: 'dashboard', to: '/', label: 'Özet', icon: 'dashboard', end: true },
  { key: 'appointments', to: '/randevular', label: 'Takvim', icon: 'calendar' },
  { key: 'sales', to: '/satis', label: 'Satış', icon: 'pos' },
  { key: 'guests', to: '/misafirler', label: 'Misafir', icon: 'guests' },
  { key: 'finance', to: '/finans', label: 'Finans', icon: 'finance' },
]

export default function BottomNav() {
  const { canAccess, setSidebarOpen } = useStore()
  const items = ITEMS.filter((i) => canAccess(i.key)).slice(0, 4)

  return (
    <nav className="bottom-nav">
      {items.map((i) => {
        const I = Icon[i.icon]
        return (
          <NavLink key={i.key} to={i.to} end={i.end}
            className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}>
            <I /><span>{i.label}</span>
          </NavLink>
        )
      })}
      <button className="bn-item" onClick={() => setSidebarOpen(true)}>
        <Icon.settings /><span>Menü</span>
      </button>
    </nav>
  )
}
