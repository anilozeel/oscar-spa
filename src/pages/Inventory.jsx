import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Button, Stat, Modal } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Inventory() {
  const { inventory, adjustStock, addInventory, fmtTRY } = useStore()
  const [add, setAdd] = useState(false)
  const critical = inventory.filter((i) => i.qty < i.min)
  const totalValue = inventory.reduce((s, i) => s + i.qty * i.cost, 0)

  return (
    <div className="page">
      <PageHead title="Stok Yönetimi" sub="Ürün, sarf ve kritik stok uyarıları tek ekranda."
        action={<Button icon="plus" onClick={() => setAdd(true)}>Ürün Ekle</Button>} />

      <div className="grid g-3">
        <Stat label="Toplam ürün çeşidi" value={inventory.length} icon="stock" />
        <Stat label="Kritik seviyede" value={critical.length} icon="info" />
        <Stat label="Stok değeri" value={fmtTRY(totalValue)} icon="finance" />
      </div>

      {critical.length > 0 && (
        <Panel className="section-gap" title="Stok Uyarıları"
          action={<Badge kind="free">{critical.length} kritik</Badge>}>
          <div className="grid g-2">
            {critical.map((i) => (
              <div key={i.id} className="between" style={{ padding: '12px 16px', background: 'var(--gold-tint)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{i.name}</div>
                  <div className="small" style={{ color: 'var(--gold-deep)' }}>Min. {i.min} {i.unit} olmalı</div>
                </div>
                <div className="right">
                  <div className="display" style={{ fontWeight: 700, fontSize: 18, color: 'var(--gold-deep)' }}>{i.qty} kaldı</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="section-gap" title="Tüm Ürünler">
        <table className="table">
          <thead><tr><th>Ürün</th><th>Kategori</th><th className="num">Stok</th><th className="num">Min.</th><th className="num">Birim maliyet</th><th>Durum</th><th className="num">İşlem</th></tr></thead>
          <tbody>
            {inventory.map((i) => {
              const low = i.qty < i.min
              return (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.name}</td>
                  <td><span className="chip ghost">{i.cat}</span></td>
                  <td className="num" style={{ fontWeight: 600, color: low ? 'var(--gold-deep)' : 'var(--ink)' }}>{i.qty} {i.unit}</td>
                  <td className="num muted">{i.min}</td>
                  <td className="num money">{fmtTRY(i.cost)}</td>
                  <td><Badge kind={low ? 'free' : 'sage'} dot={low ? 'var(--warn)' : 'var(--success)'}>{low ? 'Kritik' : 'Yeterli'}</Badge></td>
                  <td className="num">
                    <div className="center gap-sm" style={{ justifyContent: 'flex-end' }}>
                      <button className="x-btn" style={{ width: 30, height: 30 }} onClick={() => adjustStock(i.id, -1)}><Icon.x style={{ width: 14, height: 14 }} /></button>
                      <button className="x-btn" style={{ width: 30, height: 30, background: 'var(--sage-soft)', color: 'var(--forest)' }} onClick={() => adjustStock(i.id, +1)}><Icon.plus style={{ width: 14, height: 14 }} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Panel>

      {add && <NewInventory onClose={() => setAdd(false)} addInventory={addInventory} />}
    </div>
  )
}

function NewInventory({ onClose, addInventory }) {
  const [f, setF] = useState({ name: '', cat: 'Sarf', qty: 20, min: 10, unit: 'adet', cost: 100 })
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const valid = f.name.trim() && Number(f.qty) >= 0 && Number(f.min) >= 0

  const save = () => {
    addInventory({
      name: f.name.trim(), cat: f.cat, unit: f.unit,
      qty: Number(f.qty), min: Number(f.min), cost: Number(f.cost),
    })
    onClose()
  }

  return (
    <Modal title="Ürün Ekle" sub="Stok listesine yeni ürün / sarf ekleyin." onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
        <Button icon="check" disabled={!valid} onClick={save}>Ürünü Ekle</Button>
      </>}>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Ürün adı</label>
        <input className="input" autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Örn. Masaj Yağı 100 ml" />
      </div>
      <div className="grid g-2" style={{ gap: 14 }}>
        <div className="field">
          <label>Kategori</label>
          <select className="select" value={f.cat} onChange={(e) => set('cat', e.target.value)}>
            <option>Sarf</option><option>Tekstil</option><option>Ürün</option>
          </select>
        </div>
        <div className="field">
          <label>Birim</label>
          <select className="select" value={f.unit} onChange={(e) => set('unit', e.target.value)}>
            <option>adet</option><option>set</option><option>çift</option><option>kutu</option>
          </select>
        </div>
      </div>
      <div className="grid g-3" style={{ gap: 12, marginTop: 14 }}>
        <div className="field">
          <label>Stok</label>
          <input className="input" type="number" min="0" value={f.qty} onChange={(e) => set('qty', e.target.value)} />
        </div>
        <div className="field">
          <label>Min. seviye</label>
          <input className="input" type="number" min="0" value={f.min} onChange={(e) => set('min', e.target.value)} />
        </div>
        <div className="field">
          <label>Birim maliyet (₺)</label>
          <input className="input" type="number" min="0" step="10" value={f.cost} onChange={(e) => set('cost', e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
