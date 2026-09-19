import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import Icon from './icons.jsx'

export default function Topbar() {
  const { user, logout, canAccess, setSidebarOpen } = useStore()
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)
  const nav = useNavigate()

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menü">
        <Icon.dashboard />
      </button>
      <div className="top-search">
        <Icon.search />
        <input placeholder="Misafir, randevu, hizmet ara..." />
      </div>
      <div className="top-spacer" />
      <button className="icon-btn" aria-label="Bildirimler"><Icon.bell /><span className="dot" /></button>

      <div className="profile-wrap" ref={ref}>
        <button className="avatar" title={user?.roleName} onClick={() => setMenu((v) => !v)}>
          {user?.initials}
        </button>
        {menu && (
          <div className="profile-menu card">
            <div className="pm-head">
              <div className="avatar sm">{user?.initials}</div>
              <div>
                <div className="pm-name">{user?.name}</div>
                <div className="pm-role">{user?.roleName}</div>
              </div>
            </div>
            {canAccess('settings') && (
              <button className="pm-item" onClick={() => { setMenu(false); nav('/ayarlar') }}>
                <Icon.settings /> Ayarlar
              </button>
            )}
            <button className="pm-item danger" onClick={() => { setMenu(false); logout() }}>
              <Icon.logout /> Çıkış yap
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
