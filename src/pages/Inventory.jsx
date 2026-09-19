import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Button, Stat } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Inventory() {
  const { inventory, adjustStock, fmtTRY } = useStore()
  const critical = inventory.filter((i) => i.qty < i.min)
  const totalValue = inventory.reduce((s, i) => s + i.qty * i.cost, 0)

  return (
    <div className="page">
      <PageHead title="Stok Yönetimi" sub="Ürün, sarf ve kritik stok uyarıları tek ekranda."
        action={<Button icon="plus">Ürün Ekle</Button>} />

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
    </div>
  )
}
