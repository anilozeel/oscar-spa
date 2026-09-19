import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Progress, Badge, Button, Stat } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Packages() {
  const { packages, fmtTRY } = useStore()
  const totalValue = packages.reduce((s, p) => s + p.price, 0)
  const active = packages.filter((p) => p.used < p.total).length

  return (
    <div className="page">
      <PageHead title="Paket & Üyelik" sub="Seans paketleri, kalan kullanım ve son kullanma tarihleri."
        action={<Button icon="plus">Yeni Paket Sat</Button>} />

      <div className="grid g-3">
        <Stat label="Aktif paket" value={active} icon="package" />
        <Stat label="Toplam paket değeri" value={fmtTRY(totalValue)} icon="finance" />
        <Stat label="Bu ay satılan" value="7" delta={9} icon="tag" />
      </div>

      <div className="grid g-2 section-gap">
        {packages.map((p) => {
          const pct = Math.round((p.used / p.total) * 100)
          const remain = p.total - p.used
          const low = remain <= 1
          return (
            <div key={p.id} className="card pad">
              <div className="between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16.5, color: 'var(--forest-ink)' }}>{p.name}</div>
                  <div className="muted small" style={{ marginTop: 3 }}>{p.guest}</div>
                </div>
                <Badge kind={low ? 'free' : 'sage'}>{remain} seans kaldı</Badge>
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <span className="muted small">Kullanım</span>
                  <span className="small" style={{ fontWeight: 600 }}>{p.used} / {p.total}</span>
                </div>
                <Progress value={pct} kind={low ? 'danger' : ''} />
              </div>
              <div className="between" style={{ marginTop: 16 }}>
                <span className="muted small center" style={{ gap: 5 }}><Icon.clock style={{ width: 14, height: 14 }} /> Son kullanma: {p.expiry}</span>
                <span className="money">{fmtTRY(p.price)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
