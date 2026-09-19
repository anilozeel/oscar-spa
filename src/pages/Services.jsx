import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Button, Modal } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Services() {
  const { services, fmtTRY, fmtUSD, commissionFor, ROOM_TYPE_LABEL, PACKAGE_INFO, SOLO_INFO, addService } = useStore()
  const [mode, setMode] = useState('solo') // solo | package
  const [add, setAdd] = useState(false)
  const massages = services.filter((s) => s.cat === 'Masaj')
  const hamam = services.filter((s) => s.cat === 'Hamam')

  return (
    <div className="page">
      <PageHead title="Hizmetler" sub="Spa & Wellness menüsü — Sadece Masaj ve Paket fiyatları, süre, oda tipi ve prim."
        action={<Button icon="plus" onClick={() => setAdd(true)}>Yeni Hizmet</Button>} />

      <Panel title="Spa & Wellness Menü" serif
        action={
          <div className="seg">
            <button className={mode === 'solo' ? 'on' : ''} onClick={() => setMode('solo')}>Sadece Masaj</button>
            <button className={mode === 'package' ? 'on' : ''} onClick={() => setMode('package')}>Paket</button>
          </div>
        }>
        <p className="muted" style={{ marginTop: -8, marginBottom: 6, fontStyle: 'italic' }}>
          {mode === 'package' ? PACKAGE_INFO : SOLO_INFO}
        </p>
        <div className="menu-list">
          {massages.map((s) => {
            const price = mode === 'package' ? (s.pkgPrice ?? s.price) : s.price
            const usd = commissionFor(mode === 'package' && s.hasPackage ? 'package' : 'massage')
            return (
              <div key={s.id} className="menu-row">
                <div className="mr-name">
                  {s.name} {s.tag && <span className="muted small">({s.tag})</span>}
                </div>
                <div className="mr-dots" />
                <div className="mr-right">
                  <span className="muted small nowrap" style={{ marginRight: 14 }}>prim {fmtUSD(usd)}</span>
                  <span className="mr-price">{fmtTRY(price)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel className="section-gap" title="Hamam & Diğer">
        <div className="grid g-2">
          {hamam.map((s) => {
            const I = Icon[s.icon] || Icon.drop
            const usd = s.commissionType === 'none' ? 0 : commissionFor(s.commissionType)
            return (
              <div key={s.id} className="card pad" style={s.free ? { borderColor: 'var(--gold-soft)', background: 'var(--gold-tint)' } : {}}>
                <div className="between">
                  <div className="t-ic" style={{ background: s.free ? '#fff' : 'var(--sage-tint)', color: s.free ? 'var(--gold-deep)' : 'var(--sage-deep)' }}><I /></div>
                  {s.free ? <Badge kind="free">ÜCRETSİZ</Badge> : <span className="chip">{s.cat}</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16.5, color: 'var(--forest-ink)', marginTop: 14 }}>{s.name}</div>
                <div className="center gap-sm muted small" style={{ marginTop: 6 }}>
                  <span className="center" style={{ gap: 4 }}><Icon.clock style={{ width: 14, height: 14 }} /> {s.duration} dk</span>
                  <span>·</span>
                  <span>{s.roomTypes.map((t) => ROOM_TYPE_LABEL[t]).join(' / ')}</span>
                </div>
                <div className="between" style={{ marginTop: 16, alignItems: 'flex-end' }}>
                  <div>
                    <div className="muted small">Fiyat</div>
                    <div className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--forest)' }}>{s.price ? fmtTRY(s.price) : '₺0'}</div>
                  </div>
                  <div className="right">
                    <div className="muted small">Prim</div>
                    <div style={{ fontWeight: 600, color: usd ? 'var(--gold-deep)' : 'var(--muted)' }}>{usd ? fmtUSD(usd) : '—'}</div>
                  </div>
                </div>
                {s.free && (
                  <div className="small" style={{ marginTop: 14, color: 'var(--gold-deep)', display: 'flex', gap: 8 }}>
                    <Icon.info style={{ width: 16, height: 16, flex: 'none' }} />
                    Terapist seçilmez · takvimde “HAMAM • ÜCRETSİZ” · kapasiteyi bloke eder
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Panel>

      {add && <NewService onClose={() => setAdd(false)} addService={addService} fmtTRY={fmtTRY} />}
    </div>
  )
}

function NewService({ onClose, addService, fmtTRY }) {
  const [f, setF] = useState({ name: '', cat: 'Masaj', duration: 50, price: 2000, hasPackage: true, pkgPrice: 2400 })
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const isMasaj = f.cat === 'Masaj'
  const valid = f.name.trim() && Number(f.price) >= 0 && Number(f.duration) > 0

  const save = () => {
    addService({
      name: f.name.trim(),
      cat: f.cat,
      duration: Number(f.duration),
      price: Number(f.price),
      hasPackage: isMasaj && f.hasPackage,
      ...(isMasaj && f.hasPackage ? { pkgPrice: Number(f.pkgPrice) } : {}),
      roomTypes: isMasaj ? ['room', 'vip'] : ['hammam'],
      commissionType: isMasaj ? 'massage' : 'scrub',
      icon: isMasaj ? 'therapist' : 'drop',
    })
    onClose()
  }

  return (
    <Modal title="Yeni Hizmet" sub="Menüye yeni bir hizmet ekleyin." onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
        <Button icon="check" disabled={!valid} onClick={save}>Hizmeti Ekle</Button>
      </>}>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Hizmet adı</label>
        <input className="input" autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Örn. Refleksoloji Masajı" />
      </div>
      <div className="grid g-2" style={{ gap: 14 }}>
        <div className="field">
          <label>Kategori</label>
          <select className="select" value={f.cat} onChange={(e) => set('cat', e.target.value)}>
            <option value="Masaj">Masaj</option>
            <option value="Hamam">Hamam</option>
          </select>
        </div>
        <div className="field">
          <label>Süre (dk)</label>
          <input className="input" type="number" min="5" step="5" value={f.duration} onChange={(e) => set('duration', e.target.value)} />
        </div>
      </div>
      <div className="grid g-2" style={{ gap: 14, marginTop: 14 }}>
        <div className="field">
          <label>{isMasaj ? 'Sadece Masaj fiyatı (₺)' : 'Fiyat (₺)'}</label>
          <input className="input" type="number" min="0" step="50" value={f.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        {isMasaj && (
          <div className="field">
            <label>Paket fiyatı (₺)</label>
            <input className="input" type="number" min="0" step="50" value={f.pkgPrice} onChange={(e) => set('pkgPrice', e.target.value)} disabled={!f.hasPackage} />
          </div>
        )}
      </div>
      {isMasaj && (
        <label className="center gap-sm small" style={{ marginTop: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={f.hasPackage} onChange={(e) => set('hasPackage', e.target.checked)} />
          Paket satışı da sunulsun (50 dk masaj + 30 dk kese & köpük · sauna, hamam, maske & içecek)
        </label>
      )}
      <div className="card" style={{ background: 'var(--surface-2)', marginTop: 16 }}>
        <div className="kv"><span className="k">Prim</span><span className="v">{isMasaj ? 'Masaj $1.00 · Paket $1.50' : 'Kese/Köpük $0.50'}</span></div>
        <div className="kv"><span className="k">Oda tipi</span><span className="v">{isMasaj ? 'Oda / VIP' : 'Hamam'}</span></div>
      </div>
    </Modal>
  )
}
