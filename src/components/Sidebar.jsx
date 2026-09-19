import { NavLink } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import Logo from './Logo.jsx'
import Icon from './icons.jsx'

const NAV = [
  { section: 'Operasyon' },
  { key: 'dashboard',    to: '/',            label: 'Dashboard',   icon: 'dashboard' },
  { key: 'appointments', to: '/randevular',  label: 'Randevular',  icon: 'calendar' },
  { key: 'floor',        to: '/spa-floor',   label: 'Spa Floor',   icon: 'floor' },
  { key: 'guests',       to: '/misafirler',  label: 'Misafirler',  icon: 'guests' },
  { key: 'therapists',   to: '/terapistler', label: 'Terapistler', icon: 'therapist' },
  { section: 'Satış & Ürün' },
  { key: 'services',     to: '/hizmetler',   label: 'Hizmetler',   icon: 'leaf' },
  { key: 'packages',     to: '/paketler',    label: 'Paket & Üyelik', icon: 'package' },
  { key: 'sales',        to: '/satis',       label: 'Satış & POS', icon: 'pos' },
  { key: 'inventory',    to: '/stok',        label: 'Stok',        icon: 'stock' },
  { section: 'Yönetim' },
  { key: 'finance',      to: '/finans',      label: 'Finans',      icon: 'finance' },
  { key: 'reports',      to: '/raporlar',    label: 'Raporlama',   icon: 'report' },
  { key: 'settings',     to: '/ayarlar',     label: 'Ayarlar',     icon: 'settings' },
]

export default function Sidebar() {
  const { user, logout, canAccess, sidebarOpen, setSidebarOpen } = useStore()

  return (
    <>
      <div className={`scrim-mobile ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Logo />
        <nav className="nav">
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="nav-section">{item.section}</div>
            if (!canAccess(item.key)) return null
            const I = Icon[item.icon]
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <I /> <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="side-foot">
          <div className="side-user">
            <div className="avatar sm">{user?.initials}</div>
            <div className="meta">
              <div className="nm">{user?.name}</div>
              <div className="rl">{user?.roleName}</div>
            </div>
            <button className="side-logout" title="Çıkış" onClick={logout}><Icon.logout /></button>
          </div>
        </div>
      </aside>
    </>
  )
}
