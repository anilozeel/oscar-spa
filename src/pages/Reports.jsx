import { useState, useMemo } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Stat, Button, Chip } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const fmtTRYv = (n) => '₺' + Math.round(Number(n) || 0).toLocaleString('tr-TR')

export default function Reports() {
  const { therapists, fmtUSD, aiSuggestions, toast, sales, commissions, appointments, guests, packages } = useStore()
  const [open, setOpen] = useState(null)

  // --- Canlı toplamlar (tüm veriden) -------------------------------------
  const totals = useMemo(() => {
    const revenue = sales.reduce((x, s) => x + (Number(s.amount) || 0), 0)
    const count = sales.length
    const basket = count ? Math.round(revenue / count) : 0
    return { revenue, count, basket, guests: guests.length }
  }, [sales, guests])

  // --- Hizmet bazlı satış -------------------------------------------------
  const byService = useMemo(() => {
    const m = new Map()
    for (const s of sales) {
      const k = s.service || '—'
      const r = m.get(k) || { name: k, count: 0, total: 0 }
      r.count++; r.total += Number(s.amount) || 0
      m.set(k, r)
    }
    return [...m.values()].sort((a, b) => b.total - a.total)
  }, [sales])

  // --- Terapist performansı (canlı: prim = commissions, işlem = komisyon adedi) ---
  const byTherapist = useMemo(() => {
    const m = new Map()
    for (const t of therapists) m.set(t.id, { id: t.id, name: t.name, count: 0, usd: 0 })
    for (const c of commissions) {
      const r = m.get(c.therapistId) || { id: c.therapistId, name: c.therapist || '—', count: 0, usd: 0 }
      r.count++; r.usd += Number(c.usd) || 0
      m.set(c.therapistId, r)
    }
    const arr = [...m.values()]
    const max = Math.max(1, ...arr.map((r) => r.count))
    return arr.map((r) => ({ ...r, load: Math.round((r.count / max) * 100) })).sort((a, b) => b.usd - a.usd)
  }, [therapists, commissions])

  // --- Saat bazlı yoğunluk (randevulardan) -------------------------------
  const byHour = useMemo(() => {
    const m = new Map()
    for (const a of appointments) {
      const h = String(a.time || '').slice(0, 2)
      if (!h) continue
      m.set(h, (m.get(h) || 0) + 1)
    }
    return [...m.entries()].map(([h, n]) => ({ hour: h + ':00', count: n })).sort((a, b) => a.hour.localeCompare(b.hour))
  }, [appointments])

  // --- Paket kullanım analizi --------------------------------------------
  const pkgRows = useMemo(() => packages.map((p) => {
    const g = guests.find((x) => x.id === p.guestId)
    return { name: p.name || 'Paket', guest: g?.name || '—', used: p.used || 0, total: p.total || 0, left: Math.max(0, (p.total || 0) - (p.used || 0)) }
  }), [packages, guests])

  // --- Misafir geri dönüş oranı ------------------------------------------
  const retention = useMemo(() => {
    const m = new Map()
    for (const s of sales) {
      const k = (s.guest || '').trim().toLowerCase()
      if (!k) continue
      m.set(k, (m.get(k) || 0) + 1)
    }
    const uniq = m.size
    const returning = [...m.values()].filter((n) => n > 1).length
    const rate = uniq ? Math.round((returning / uniq) * 100) : 0
    const top = [...m.entries()].map(([k, n]) => {
      const s = sales.find((x) => (x.guest || '').trim().toLowerCase() === k)
      return { name: s?.guest || k, visits: n }
    }).sort((a, b) => b.visits - a.visits).slice(0, 8)
    return { uniq, returning, rate, top }
  }, [sales])

  const REPORTS = [
    { id: 'service', name: 'Hizmet bazlı satış' },
    { id: 'therapist', name: 'Terapist performansı' },
    { id: 'hour', name: 'Saat bazlı yoğunluk' },
    { id: 'package', name: 'Paket kullanım analizi' },
    { id: 'retention', name: 'Misafir geri dönüş oranı' },
  ]

  const Row = ({ cols }) => (
    <div className="between" style={{ padding: '8px 0', borderTop: '1px solid var(--line)', fontSize: 14, gap: 10 }}>
      {cols.map((c, i) => (
        <span key={i} style={{ flex: i === 0 ? '1 1 auto' : 'none', fontWeight: i === 0 ? 600 : 500, color: i === 0 ? 'var(--forest-ink)' : 'var(--ink-2)', textAlign: i === 0 ? 'left' : 'right', whiteSpace: 'nowrap' }}>{c}</span>
      ))}
    </div>
  )
  const Empty = () => <div className="muted small" style={{ padding: '10px 0' }}>Henüz veri yok.</div>

  const detail = (id) => {
    if (id === 'service') return byService.length ? byService.map((r) => <Row key={r.name} cols={[r.name, `${r.count} satış`, fmtTRYv(r.total)]} />) : <Empty />
    if (id === 'therapist') return byTherapist.map((r) => <Row key={r.id} cols={[r.name, `${r.count} işlem`, fmtUSD(r.usd)]} />)
    if (id === 'hour') return byHour.length ? byHour.map((r) => <Row key={r.hour} cols={[r.hour, `${r.count} randevu`]} />) : <Empty />
    if (id === 'package') return pkgRows.length ? pkgRows.map((r, i) => <Row key={i} cols={[`${r.name} · ${r.guest}`, `${r.used}/${r.total} kullanıldı`, `${r.left} kaldı`]} />) : <Empty />
    if (id === 'retention') return (
      <>
        <Row cols={['Benzersiz misafir', '', String(retention.uniq)]} />
        <Row cols={['Geri dönen misafir', '', String(retention.returning)]} />
        <Row cols={['Geri dönüş oranı', '', `%${retention.rate}`]} />
        {retention.top.map((t) => <Row key={t.name} cols={[t.name, '', `${t.visits} ziyaret`]} />)}
      </>
    )
    return null
  }

  const exportCSV = () => {
    const rows = [
      ['OscarSpa — Rapor', new Date().toLocaleString('tr-TR')], [],
      ['Toplam Ciro', totals.revenue], ['Toplam Adisyon', totals.count], ['Ortalama Sepet', totals.basket], ['Misafir', totals.guests], [],
      ['Hizmet', 'Satış', 'Toplam TL'], ...byService.map((r) => [r.name, r.count, r.total]), [],
      ['Terapist', 'İşlem', 'Prim USD'], ...byTherapist.map((t) => [t.name, t.count, t.usd]), [],
      ['Paket', 'Misafir', 'Kullanılan', 'Toplam'], ...pkgRows.map((p) => [p.name, p.guest, p.used, p.total]),
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
        <Stat label="Toplam Ciro" value={fmtTRYv(totals.revenue)} icon="finance" />
        <Stat label="Toplam Adisyon" value={String(totals.count)} icon="calendar" />
        <Stat label="Misafir" value={String(totals.guests)} icon="guests" />
        <Stat label="Ortalama Sepet" value={fmtTRYv(totals.basket)} icon="pos" />
      </div>

      <div className="grid section-gap" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <Panel title="Terapist Performansı">
          {byTherapist.map((t) => (
            <div key={t.id} style={{ marginBottom: 16 }}>
              <div className="between" style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span className="muted small">{t.count} işlem · {fmtUSD(t.usd)}</span>
              </div>
              <div className="progress"><span style={{ width: `${t.load}%`, background: t.load > 80 ? 'var(--gold)' : 'var(--sage)' }} /></div>
            </div>
          ))}
        </Panel>

        <Panel title="Hazır Raporlar">
          {REPORTS.map((r) => (
            <div key={r.id}>
              <div className="list-row" style={{ cursor: 'pointer' }} onClick={() => setOpen(open === r.id ? null : r.id)}>
                <div className="t-ic" style={{ width: 36, height: 36, borderRadius: 10 }}><Icon.report style={{ width: 17, height: 17 }} /></div>
                <span className="grow" style={{ fontWeight: 500 }}>{r.name}</span>
                <Icon.chevronR style={{ width: 18, height: 18, color: 'var(--muted)', transform: open === r.id ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
              </div>
              {open === r.id && <div style={{ padding: '2px 6px 12px' }}>{detail(r.id)}</div>}
            </div>
          ))}
        </Panel>
      </div>

      {/* AI Önerileri */}
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
