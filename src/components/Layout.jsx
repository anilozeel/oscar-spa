import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import BottomNav from './BottomNav.jsx'
import { useStore } from '../state/store.jsx'
import Icon from './icons.jsx'

function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind === 'warn' ? 'warn' : ''}`}>
          {t.kind === 'warn' ? <Icon.info /> : <Icon.check />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export default function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <main>
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <Toasts />
    </div>
  )
}
