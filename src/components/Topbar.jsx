import { useStore } from '../state/store.jsx'
import Icon from './icons.jsx'

export default function Topbar() {
  const { user, HOTEL, setSidebarOpen } = useStore()
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menü">
        <Icon.dashboard />
      </button>
      <div className="hotel-select">
        <Icon.pin />
        <span>{HOTEL}</span>
        <Icon.chevron className="chev" />
      </div>
      <div className="top-search">
        <Icon.search />
        <input placeholder="Misafir, randevu, hizmet ara..." />
      </div>
      <div className="top-spacer" />
      <button className="icon-btn" aria-label="Bildirimler"><Icon.bell /><span className="dot" /></button>
      <div className="avatar" title={user?.roleName}>{user?.initials}</div>
    </header>
  )
}
