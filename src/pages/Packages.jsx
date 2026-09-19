import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Progress, Badge, Button, Stat, Modal } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Packages() {
  const { packages, guests, fmtTRY, addPackage } = useStore()
  const [add, setAdd] = useState(false)
  const totalValue = packages.reduce((s, p) => s + p.price, 0)
  const active = packages.filter((p) => p.used < p.total).length

  return (
    <div className="page">
      <PageHead title="Paket & Üyelik" sub="Seans paketleri, kalan kullanım ve son kullanma tarihleri."
        action={<Button icon="plus" onClick={() => setAdd(true)}>Yeni Paket Sat</Button>} />

      <div className="grid g-3">
        <Stat label="Aktif paket" value={active} icon="package" />
        <Stat label="Toplam paket değeri" value={fmtTRY(totalValue)} icon="finance" />
        <Stat label="Toplam paket" value={packages.length} icon="tag" />
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

      {add && <NewPackage onClose={() => setAdd(false)} addPackage={addPackage} guests={guests} fmtTRY={fmtTRY} />}
    </div>
  )
}

const TEMPLATES = [
  { name: '10 Seans Masaj Paketi', total: 10, price: 16000 },
  { name: 'Aylık Hamam Üyeliği', total: 8, price: 7200 },
  { name: 'Wellness Premium', total: 12, price: 21000 },
]

function NewPackage({ onClose, addPackage, guests, fmtTRY }) {
  const [f, setF] = useState({ name: '', guestId: guests[0].id, total: 10, price: 16000, expiry: '31.12.2026' })
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const valid = f.name.trim() && Number(f.total) > 0 && Number(f.price) >= 0

  const applyTemplate = (t) => setF((s) => ({ ...s, name: t.name, total: t.total, price: t.price }))

  const save = () => {
    const g = guests.find((x) => x.id === f.guestId)
    addPackage({
      name: f.name.trim(), guestId: f.guestId, guest: g?.name,
      total: Number(f.total), price: Number(f.price), expiry: f.expiry,
    })
    onClose()
  }

  return (
    <Modal title="Yeni Paket Sat" sub="Misafire seans paketi / üyelik satışı." onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
        <Button icon="check" disabled={!valid} onClick={save}>Paketi Sat</Button>
      </>}>
      <div className="field" style={{ marginBottom: 8 }}>
        <label>Hazır şablon (opsiyonel)</label>
        <div className="center gap-sm wrap">
          {TEMPLATES.map((t) => (
            <button key={t.name} className="chip ghost" style={{ cursor: 'pointer' }} onClick={() => applyTemplate(t)}>{t.name}</button>
          ))}
        </div>
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Paket adı</label>
        <input className="input" autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Örn. 10 Seans Masaj Paketi" />
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Misafir</label>
        <select className="select" value={f.guestId} onChange={(e) => set('guestId', e.target.value)}>
          {guests.map((g) => <option key={g.id} value={g.id}>{g.name} · Oda {g.roomNo}</option>)}
        </select>
      </div>
      <div className="grid g-3" style={{ gap: 12 }}>
        <div className="field">
          <label>Seans sayısı</label>
          <input className="input" type="number" min="1" value={f.total} onChange={(e) => set('total', e.target.value)} />
        </div>
        <div className="field">
          <label>Fiyat (₺)</label>
          <input className="input" type="number" min="0" step="100" value={f.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div className="field">
          <label>Son kullanma</label>
          <input className="input" value={f.expiry} onChange={(e) => set('expiry', e.target.value)} placeholder="gg.aa.yyyy" />
        </div>
      </div>
    </Modal>
  )
}
