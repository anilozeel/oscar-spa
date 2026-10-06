import { useMemo } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Stat, Progress } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const fmtTRYv = (n) => '₺' + Math.round(Number(n) || 0).toLocaleString('tr-TR')

export default function Finance() {
  const { fmtTRY, sales, commissions, guests, fmtUSD } = useStore()

  // Canlı finans (statik mock yerine gerçek satış/primlerden) — tüm kayıtlar
  const fin = useMemo(() => {
    const income = sales.reduce((a, s) => a + (Number(s.amount) || 0), 0)
    const commissionUsd = commissions.reduce((a, c) => a + (Number(c.usd) || 0), 0)
    const count = sales.length
    const basket = count ? Math.round(income / count) : 0
    return { income, expense: 0, commissionUsd, net: income, count, basket }
  }, [sales, commissions])

  const rows = [
    { k: 'Gelir', v: fin.income, color: 'var(--success)' },
    { k: 'Gider', v: fin.expense, color: 'var(--danger)' },
  ]
  const max = Math.max(1, fin.income)

  return (
    <div className="page">
      <PageHead title="Finans" sub="Yönetici tarafında sayılar net, anlaşılır ve günlük karar vermeye uygun olmalı." />

      <div className="grid g-4">
        <Stat label="Toplam Ciro" value={fmtTRYv(fin.income)} icon="finance" />
        <Stat label="Toplam Adisyon" value={String(fin.count)} icon="calendar" />
        <Stat label="Misafir" value={String(guests.length)} icon="guests" />
        <Stat label="Ortalama Sepet" value={fmtTRYv(fin.basket)} icon="pos" />
      </div>

      <div className="grid section-gap" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start' }}>
        <Panel title="Finans Özeti (Toplam)">
          {rows.map((r) => (
            <div key={r.k} style={{ marginBottom: 18 }}>
              <div className="between" style={{ marginBottom: 7 }}>
                <span style={{ fontWeight: 500 }}>{r.k}</span>
                <span className="money" style={{ color: r.color }}>{fmtTRYv(r.v)}</span>
              </div>
              <div className="progress"><span style={{ width: `${(r.v / max) * 100}%`, background: r.color }} /></div>
            </div>
          ))}
          <div className="between" style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>Komisyon (prim)</span>
            <span className="money" style={{ color: 'var(--gold-deep)' }}>{fmtUSD(fin.commissionUsd)}</span>
          </div>
          <div className="between" style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>Net Ciro</span>
            <span className="display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--forest)' }}>{fmtTRYv(fin.net)}</span>
          </div>
        </Panel>

        <Panel title="Tahsilat (Ödeme Tipine Göre)">
          <div className="grid g-2" style={{ gap: 12 }}>
            {[
              { k: 'Nakit', v: sales.filter(s => s.payType === 'cash').reduce((a, s) => a + s.amount, 0), i: 'cash' },
              { k: 'Kart', v: sales.filter(s => s.payType === 'card').reduce((a, s) => a + s.amount, 0), i: 'card' },
              { k: 'Havale', v: sales.filter(s => s.payType === 'transfer').reduce((a, s) => a + s.amount, 0), i: 'finance' },
              { k: 'Odaya Yaz', v: sales.filter(s => s.payType === 'folio').reduce((a, s) => a + s.amount, 0), i: 'room' },
              { k: 'Prim (USD)', v: null, usd: commissions.reduce((a, c) => a + (c.usd || 0), 0), i: 'therapist' },
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
