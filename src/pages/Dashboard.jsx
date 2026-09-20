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
  { to: '/misafirler', icon: 'guests', t: 'Misafir CRM', s: 'Geçmiş & tercihler' },
  { to: '/satis', icon: 'pos', t: 'Satış & POS', s: 'Ödeme & adisyon' },
  { to: '/raporlar', icon: 'report', t: 'Raporlama', s: 'Ciro & performans' },
]

function DateChip() {
  return (
    <div className="center" style={{ color: 'var(--muted)' }}>
      <Icon.calendar style={{ width: 18, height: 18 }} />
      <span style={{ textTransform: 'capitalize' }}>{TODAY}</span>
    </div>
  )
}

const statusBadge = (s) => s === 'done' ? 'vip' : s === 'inservice' ? 'free' : 'sage'
const statusLabel = (s) => s === 'done' ? 'Tamamlandı' : s === 'inservice' ? 'İşlemde' : 'Planlandı'

// ---- Terapist paneli (para yok) ---------------------------------------------
function TherapistDashboard({ store, nav }) {
  const { user, visibleAppointments } = store
  const mine = visibleAppointments.filter((a) => a.therapistId === user.therapistId)
  const upcoming = mine.filter((a) => a.status !== 'done').sort((a, b) => a.time.localeCompare(b.time))
  const done = mine.filter((a) => a.status === 'done').length
  const next = upcoming[0]

  return (
    <div className="page">
      <div className="page-head between wrap">
        <div>
          <h1 className="page-title">{greet()}, {user?.name}</h1>
          <p className="page-sub">Bugünkü programınız aşağıda. Kolay gelsin!</p>
        </div>
        <DateChip />
      </div>

      <div className="grid g-3">
        <Stat label="Bugünkü randevunuz" value={mine.length} icon="calendar" />
        <Stat label="Tamamlanan" value={done} icon="check" />
        <Stat label="Sıradaki randevu" value={next ? next.time : '—'} icon="clock" />
      </div>

      <Panel className="section-gap" title="Bugünkü Programınız"
        action={<a className="link-more" onClick={() => nav('/randevular')}>Takvimi Aç <Icon.chevronR /></a>}>
        {mine.length ? [...mine].sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
          <div className="list-row" key={a.id} style={{ cursor: 'pointer' }} onClick={() => nav('/randevular')}>
            <div className="chip ghost" style={{ minWidth: 62, justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>{a.time}</div>
            <div className="grow">
              <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{a.service}{a.variant === 'package' ? ' · Paket' : ''}</div>
              <div className="muted small">{a.guest}</div>
            </div>
            <Badge kind={statusBadge(a.status)}>{statusLabel(a.status)}</Badge>
          </div>
        )) : <p className="muted small">Bugün için size atanmış randevu yok.</p>}
      </Panel>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const store = useStore()
  const { user, visibleAppointments, KPIS } = store

  if (user?.role === 'therapist') return <TherapistDashboard store={store} nav={nav} />

  const today = visibleAppointments.filter((a) => a.status !== 'done')

  return (
    <div className="page">
      <div className="page-head between wrap">
        <div>
          <h1 className="page-title">{greet()}, {user?.name?.split(' ')[0]}</h1>
          <p className="page-sub">Bugün harika bir gün, misafirlerinizi bekliyor.</p>
        </div>
        <DateChip />
      </div>

      <div className="grid g-4">
        <Stat label={KPIS.revenue.label} value={KPIS.revenue.value} delta={KPIS.revenue.delta} icon="finance" />
        <Stat label={KPIS.appts.label} value={KPIS.appts.value} delta={KPIS.appts.delta} icon="calendar" />
        <Stat label={KPIS.basket.label} value={KPIS.basket.value} delta={KPIS.basket.delta} icon="pos" />
        <Stat label={KPIS.guests.label} value={KPIS.guests.value} delta={KPIS.guests.delta} icon="guests" />
      </div>

      <Panel className="section-gap" title="Bugünkü Randevular"
        action={<a className="link-more" onClick={() => nav('/randevular')}>Tümünü Gör <Icon.chevronR /></a>}>
        {today.length ? today.slice(0, 8).map((a) => (
          <div className="list-row" key={a.id} style={{ cursor: 'pointer' }} onClick={() => nav('/randevular')}>
            <div className="chip ghost" style={{ minWidth: 62, justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>{a.time}</div>
            <div className="grow">
              <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>
                {a.service} {a.freeHammam && <Badge kind="free">ÜCRETSİZ</Badge>}
              </div>
              <div className="muted small">{a.guest} · {a.therapist || 'Terapistsiz'}</div>
            </div>
            <Badge kind={statusBadge(a.status)}>{statusLabel(a.status)}</Badge>
          </div>
        )) : <p className="muted small">Bugün için randevu yok. Takvimden boş bir saate tıklayarak randevu açabilirsiniz.</p>}
      </Panel>

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
