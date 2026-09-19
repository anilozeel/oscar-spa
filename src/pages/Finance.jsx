import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Stat, Progress } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Finance() {
  const { FINANCE, KPIS, fmtTRY, sales, fmtUSD } = useStore()
  const rows = [
    { k: 'Gelir', v: FINANCE.income, color: 'var(--success)' },
    { k: 'Gider', v: FINANCE.expense, color: 'var(--danger)' },
    { k: 'Komisyon', v: FINANCE.commission, color: 'var(--gold-deep)' },
  ]
  const max = FINANCE.income

  return (
    <div className="page">
      <PageHead title="Finans" sub="Yönetici tarafında sayılar net, anlaşılır ve günlük karar vermeye uygun olmalı." />

      <div className="grid g-4">
        <Stat label={KPIS.revenue.label} value={KPIS.revenue.value} delta={KPIS.revenue.delta} icon="finance" />
        <Stat label={KPIS.appts.label} value={KPIS.appts.value} delta={KPIS.appts.delta} icon="calendar" />
        <Stat label={KPIS.occupancy.label} value={KPIS.occupancy.value} delta={KPIS.occupancy.delta} icon="floor" />
        <Stat label={KPIS.basket.label} value={KPIS.basket.value} delta={KPIS.basket.delta} icon="pos" />
      </div>

      <div className="grid section-gap" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start' }}>
        <Panel title="Aylık Finans Özeti">
          {rows.map((r) => (
            <div key={r.k} style={{ marginBottom: 18 }}>
              <div className="between" style={{ marginBottom: 7 }}>
                <span style={{ fontWeight: 500 }}>{r.k}</span>
                <span className="money" style={{ color: r.color }}>{fmtTRY(r.v)}</span>
              </div>
              <div className="progress"><span style={{ width: `${(r.v / max) * 100}%`, background: r.color }} /></div>
            </div>
          ))}
          <div className="between" style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>Net</span>
            <span className="display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--forest)' }}>{fmtTRY(FINANCE.net)}</span>
          </div>
        </Panel>

        <Panel title="Bugün Tahsilat">
          <div className="grid g-2" style={{ gap: 12 }}>
            {[
              { k: 'Nakit', v: sales.filter(s => s.payType === 'cash').reduce((a, s) => a + s.amount, 0), i: 'cash' },
              { k: 'Kart', v: sales.filter(s => s.payType === 'card').reduce((a, s) => a + s.amount, 0), i: 'card' },
              { k: 'Odaya Yaz', v: sales.filter(s => s.payType === 'folio').reduce((a, s) => a + s.amount, 0), i: 'room' },
              { k: 'Prim (USD)', v: null, usd: sales.reduce((a, s) => a + s.commissionUsd, 0), i: 'therapist' },
            ].map((c) => {
              const I = Icon[c.i]
              return (
                <div key={c.k} className="card" style={{ background: 'var(--surface-2)', padding: 16 }}>
                  <div className="t-ic" style={{ width: 34, height: 34, borderRadius: 10 }}><I style={{ width: 17, height: 17 }} /></div>
                  <div className="muted small" style={{ marginTop: 10 }}>{c.k}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--forest-ink)' }}>{c.usd != null ? fmtUSD(c.usd) : fmtTRY(c.v)}</div>
                </div>
              )
            })}
          </div>
          <p className="muted small" style={{ marginTop: 16 }}>Bu tablo, Satış &amp; POS ekranında kapattığınız adisyonlardan canlı beslenir.</p>
        </Panel>
      </div>
    </div>
  )
}
