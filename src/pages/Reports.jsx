import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Stat, Button, Chip } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const REPORTS = [
  'Hizmet bazlı satış', 'Terapist performansı', 'Saat bazlı yoğunluk',
  'Paket kullanım analizi', 'Misafir geri dönüş oranı',
]

export default function Reports() {
  const { KPIS, therapists, fmtUSD, aiSuggestions, toast, sales } = useStore()

  const exportCSV = () => {
    const rows = [
      ['OscarSpa — Rapor', new Date().toLocaleString('tr-TR')],
      [],
      ['KPI', 'Değer', 'Değişim'],
      ...Object.values(KPIS).map((k) => [k.label, k.value, `+${k.delta}%`]),
      [],
      ['Terapist', 'Bugünkü işlem', 'Aylık prim (USD)', 'Doluluk %'],
      ...therapists.map((t) => [t.name, t.todayCount, t.monthCommissionUsd, t.load]),
      [],
      ['Kapatılan adisyonlar (bu oturum)', sales.length],
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '')}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oscarspa-rapor-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    toast('Rapor CSV olarak indirildi')
  }

  return (
    <div className="page">
      <PageHead title="Raporlama" sub="Ciro, doluluk ve hizmet analizleri; günlük karar vermeye uygun net raporlar."
        action={<Button variant="ghost" icon="report" onClick={exportCSV}>Dışa Aktar</Button>} />

      <div className="grid g-4">
        <Stat label={KPIS.revenue.label} value={KPIS.revenue.value} delta={KPIS.revenue.delta} icon="finance" />
        <Stat label={KPIS.appts.label} value={KPIS.appts.value} delta={KPIS.appts.delta} icon="calendar" />
        <Stat label={KPIS.occupancy.label} value={KPIS.occupancy.value} delta={KPIS.occupancy.delta} icon="floor" />
        <Stat label={KPIS.basket.label} value={KPIS.basket.value} delta={KPIS.basket.delta} icon="pos" />
      </div>

      <div className="grid section-gap" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <Panel title="Terapist Performansı">
          {[...therapists].sort((a, b) => b.load - a.load).map((t) => (
            <div key={t.id} style={{ marginBottom: 16 }}>
              <div className="between" style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span className="muted small">{t.todayCount} işlem · {fmtUSD(t.monthCommissionUsd)}</span>
              </div>
              <div className="progress"><span style={{ width: `${t.load}%`, background: t.load > 80 ? 'var(--gold)' : 'var(--sage)' }} /></div>
            </div>
          ))}
        </Panel>

        <Panel title="Hazır Raporlar">
          {REPORTS.map((r) => (
            <div key={r} className="list-row" style={{ cursor: 'pointer' }} onClick={() => toast(`"${r}" raporu hazırlanıyor...`)}>
              <div className="t-ic" style={{ width: 36, height: 36, borderRadius: 10 }}><Icon.report style={{ width: 17, height: 17 }} /></div>
              <span className="grow" style={{ fontWeight: 500 }}>{r}</span>
              <Icon.chevronR style={{ width: 18, height: 18, color: 'var(--muted)' }} />
            </div>
          ))}
        </Panel>
      </div>

      {/* AI Önerileri (Sayfa 13) */}
      <Panel className="section-gap" title="AI Önerileri" serif
        action={<Chip kind="gold"><Icon.spark style={{ width: 14, height: 14 }} /> Akıllı öneriler</Chip>}>
        <div className="grid g-2">
          {aiSuggestions.map((a) => {
            const I = Icon[a.icon] || Icon.spark
            return (
              <div key={a.id} className="card" style={{ background: 'var(--surface-2)', padding: 18 }}>
                <div className="center gap-sm">
                  <div className="t-ic" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--gold-tint)', color: 'var(--gold-deep)' }}><I style={{ width: 17, height: 17 }} /></div>
                  <span className="eyebrow">{a.type}</span>
                </div>
                <p style={{ marginTop: 12, color: 'var(--ink-2)', fontSize: 14 }}>{a.text}</p>
                <Button sm variant="ghost" style={{ marginTop: 14 }} onClick={() => toast(a.cta + ' — hazırlanıyor')}>{a.cta}</Button>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
