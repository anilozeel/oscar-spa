import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import { Panel, Stat, Badge } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const TODAY = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' })
const greet = () => {
  const h = new Date().getHours()
  if (h < 11) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

const MODULES = [
  { to: '/randevular', icon: 'calendar', t: 'Randevu Takvimi', s: 'Saatlik planlama' },
  { to: '/spa-floor', icon: 'floor', t: 'Spa Floor', s: 'Oda & kabin doluluk' },
  { to: '/misafirler', icon: 'guests', t: 'Misafir CRM', s: 'Geçmiş & tercihler' },
  { to: '/satis', icon: 'pos', t: 'Satış & POS', s: 'Ödeme & adisyon' },
]

export default function Dashboard() {
  const nav = useNavigate()
  const { user, visibleAppointments, rooms, KPIS, STATUS_META } = useStore()
  const today = visibleAppointments.filter((a) => a.status !== 'done')

  return (
    <div className="page">
      {/* Greeting */}
      <div className="page-head between wrap">
        <div>
          <h1 className="page-title">{greet()}, {user?.name?.split(' ')[0]}</h1>
          <p className="page-sub">Bugün harika bir gün, misafirlerinizi bekliyor.</p>
        </div>
        <div className="center" style={{ color: 'var(--muted)' }}>
          <Icon.calendar style={{ width: 18, height: 18 }} />
          <span style={{ textTransform: 'capitalize' }}>{TODAY}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid g-4">
        <Stat label={KPIS.revenue.label} value={KPIS.revenue.value} delta={KPIS.revenue.delta} icon="finance" />
        <Stat label={KPIS.occupancy.label} value={KPIS.occupancy.value} delta={KPIS.occupancy.delta} icon="floor" />
        <Stat label={KPIS.appts.label} value={KPIS.appts.value} delta={KPIS.appts.delta} icon="calendar" />
        <Stat label={KPIS.guests.label} value={KPIS.guests.value} delta={KPIS.guests.delta} icon="guests" />
      </div>

      {/* Two columns: appts + floor */}
      <div className="grid section-gap" style={{ gridTemplateColumns: '1.15fr 1fr' }}>
        <Panel title="Bugünkü Randevular"
          action={<a className="link-more" onClick={() => nav('/randevular')}>Tümünü Gör <Icon.chevronR /></a>}>
          <div>
            {today.slice(0, 6).map((a) => (
              <div className="list-row" key={a.id} style={{ cursor: 'pointer' }} onClick={() => nav('/randevular')}>
                <div className="chip ghost" style={{ minWidth: 62, justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>{a.time}</div>
                <div className="grow">
                  <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>
                    {a.service} {a.freeHammam && <Badge kind="free">ÜCRETSİZ</Badge>}
                  </div>
                  <div className="muted small">{a.guest} · {a.therapist || 'Terapistsiz'}</div>
                </div>
                <div className="chip">{a.room}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Spa Floor"
          action={<a className="link-more" onClick={() => nav('/spa-floor')}>Tümünü Gör <Icon.chevronR /></a>}>
          <div className="legend" style={{ marginBottom: 16, gap: 16 }}>
            {Object.entries(STATUS_META).slice(0, 4).map(([k, m]) => (
              <span className="li" key={k}><span className={`status-dot dot-${m.cls}`} />{m.label}</span>
            ))}
          </div>
          <div className="grid g-4" style={{ gap: 10 }}>
            {rooms.map((r) => {
              const m = STATUS_META[r.status]
              return (
                <div key={r.id} className={`st-${m.cls}`} style={{ borderRadius: 'var(--r-md)', padding: '12px 12px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.name}</div>
                  <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>{m.label}</div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      {/* Hero + quick modules */}
      <div className="grid section-gap" style={{ gridTemplateColumns: '1.15fr 1fr' }}>
        <div className="hero-banner">
          <div>
            <div className="hb-quote">"İyi hissettiren teknoloji."</div>
            <p style={{ color: 'rgba(242,239,230,.8)', marginTop: 8 }}>Daha mutlu misafirler, daha güçlü işletmeler.</p>
          </div>
          <div className="hb-side">Daha mutlu misafirler<br />Daha güçlü işletmeler</div>
        </div>
        <div className="grid g-2" style={{ gap: 12 }}>
          {MODULES.map((m) => {
            const I = Icon[m.icon]
            return (
              <div key={m.to} className="tile" style={{ cursor: 'pointer' }} onClick={() => nav(m.to)}>
                <div className="t-ic"><I /></div>
                <div><h4>{m.t}</h4><p>{m.s}</p></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
