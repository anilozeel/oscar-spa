import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Button } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Services() {
  const { services, fmtTRY, fmtUSD, commissionFor, ROOM_TYPE_LABEL, PACKAGE_INFO, SOLO_INFO } = useStore()
  const [mode, setMode] = useState('solo') // solo | package
  const massages = services.filter((s) => s.cat === 'Masaj')
  const hamam = services.filter((s) => s.cat === 'Hamam')

  return (
    <div className="page">
      <PageHead title="Hizmetler" sub="Spa & Wellness menüsü — Sadece Masaj ve Paket fiyatları, süre, oda tipi ve prim."
        action={<Button icon="plus">Yeni Hizmet</Button>} />

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
            const price = mode === 'package' ? s.pkgPrice : s.price
            const usd = commissionFor(mode === 'package' ? 'package' : 'massage')
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
    </div>
  )
}
