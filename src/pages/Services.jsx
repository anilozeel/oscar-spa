import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Chip, Button } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Services() {
  const { services, fmtTRY, fmtUSD, commissionFor, COMMISSION_RULES, ROOM_TYPE_LABEL } = useStore()
  const cats = ['Tümü', ...new Set(services.map((s) => s.cat))]
  const [cat, setCat] = useState('Tümü')
  const list = cat === 'Tümü' ? services : services.filter((s) => s.cat === cat)

  return (
    <div className="page">
      <PageHead title="Hizmetler" sub="Spa menüsü; süre, fiyat, oda tipi ve terapist yetkinliği tek yerde."
        action={<Button icon="plus">Yeni Hizmet</Button>} />

      <div className="seg" style={{ marginBottom: 18 }}>
        {cats.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
      </div>

      <div className="grid g-3">
        {list.map((s) => {
          const I = Icon[s.icon] || Icon.leaf
          const usd = s.commissionType === 'none' ? 0 : commissionFor(s.commissionType)
          return (
            <div key={s.id} className={`card pad ${s.free ? '' : ''}`} style={s.free ? { borderColor: 'var(--gold-soft)', background: 'var(--gold-tint)' } : {}}>
              <div className="between">
                <div className="t-ic" style={{ background: s.free ? '#fff' : 'var(--sage-tint)', color: s.free ? 'var(--gold-deep)' : 'var(--sage-deep)' }}><I /></div>
                {s.free
                  ? <Badge kind="free">ÜCRETSİZ</Badge>
                  : <Chip>{s.cat}</Chip>}
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
    </div>
  )
}
