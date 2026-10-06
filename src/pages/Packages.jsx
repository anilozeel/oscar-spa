import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Progress, Badge, Button, Stat, Modal } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Packages() {
  const { packages, guests, fmtTRY, addPackage } = useStore()
  const [add, setAdd] = useState(false)
  const totalValue = packages.reduce((s, p) => s + (Number(p.price) || 0), 0)
  const active = packages.filter((p) => (p.used || 0) < (p.total || 0)).length
  const guestName = (p) => p.guest || guests.find((g) => g.id === p.guestId)?.name || '—'

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
        {packages.length === 0 && (
          <div className="card pad muted small">Henüz paketi olan misafir yok. “Yeni Paket Sat” ile paket/üyelik ekleyin.</div>
        )}
        {packages.map((p) => {
          const total = Number(p.total) || 0
          const used = Number(p.used) || 0
          const pct = total ? Math.round((used / total) * 100) : 0
          const remain = Math.max(0, total - used)
          const low = remain <= 1
          const price = Number(p.price) || 0
          return (
            <div key={p.id} className="card pad">
              <div className="between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16.5, color: 'var(--forest-ink)' }}>{guestName(p)}</div>
                  <div className="muted small" style={{ marginTop: 3 }}>{p.name}</div>
                </div>
                <Badge kind={low ? 'free' : 'sage'}>{remain} seans kaldı</Badge>
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <span className="muted small">Kullanım</span>
                  <span className="small" style={{ fontWeight: 600 }}>{used} / {total} kullanıldı</span>
                </div>
                <Progress value={pct} kind={low ? 'danger' : ''} />
              </div>
              <div className="between" style={{ marginTop: 16 }}>
                <span className="muted small center" style={{ gap: 5 }}><Icon.clock style={{ width: 14, height: 14 }} /> Son kullanma: {p.expiry || 'Süresiz'}</span>
                <span className="money">{price > 0 ? fmtTRY(price) : '—'}</span>
              </div>
            </div>
          )
        })}
      </div>

      {add && <NewPackage onClose={() => setAdd(false)} addPackage={addPackage} fmtTRY={fmtTRY} />}
    </div>
  )
}

const TEMPLATES = [
  { name: '10 Seans Masaj Paketi', total: 10, price: 16000 },
  { name: 'Aylık Hamam Üyeliği', total: 8, price: 7200 },
  { name: 'Wellness Premium', total: 12, price: 21000 },
]

function NewPackage({ onClose, addPackage, fmtTRY }) {
  const [f, setF] = useState({ name: '', guestName: '', total: 10, price: 16000, expiry: '31.12.2026' })
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const valid = f.name.trim() && f.guestName.trim() && Number(f.total) > 0 && Number(f.price) >= 0

  const applyTemplate = (t) => setF((s) => ({ ...s, name: t.name, total: t.total, price: t.price }))

  const save = () => {
    addPackage({
      name: f.name.trim(), guestId: null, guest: f.guestName.trim(),
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
        <label>Misafir adı</label>
        <input className="input" value={f.guestName} onChange={(e) => set('guestName', e.target.value)} placeholder="Örn. Ahmet Yılmaz" />
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
