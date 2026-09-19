import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Chip, Avatar, Button } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const USERS = [
  { name: 'Deniz Kaya', role: 'Owner / Genel Müdür', init: 'DK', on: true },
  { name: 'Ayşe Yıldız', role: 'Spa Manager', init: 'AY', on: true },
  { name: 'Resepsiyon 1', role: 'Resepsiyon', init: 'R1', on: true },
  { name: 'Dita', role: 'Terapist', init: 'D', on: true },
  { name: 'Sitti', role: 'Terapist', init: 'S', on: true },
  { name: 'Muhasebe', role: 'Muhasebe', init: 'M', on: false },
]

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} aria-pressed={on}
      style={{ width: 46, height: 26, borderRadius: 20, border: 'none', background: on ? 'var(--sage)' : 'var(--line)', position: 'relative', transition: 'background .2s', flex: 'none' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  )
}

export default function Settings() {
  const { ROLES, toast } = useStore()
  const [integrations, setIntegrations] = useState({ pms: true, whatsapp: true, online: false, ai: false })

  const INTS = [
    { id: 'pms', name: 'PMS / Folyo', desc: 'Otel odası ve folyo entegrasyonu — odaya yazdırma', icon: 'pms', tag: 'Öncelik' },
    { id: 'whatsapp', name: 'WhatsApp', desc: 'Randevu hatırlatma ve kampanya mesajları', icon: 'whatsapp', tag: 'Öncelik' },
    { id: 'online', name: 'Online Rezervasyon', desc: 'QR / link ile misafir self-servis rezervasyon', icon: 'online', tag: 'Yakında' },
    { id: 'ai', name: 'AI Önerileri', desc: 'Doluluk, fiyat ve kampanya önerileri', icon: 'ai', tag: 'Yakında' },
  ]

  return (
    <div className="page">
      <PageHead title="Ayarlar" sub="Kullanıcılar, roller, vergi, para birimi ve entegrasyonlar." />

      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', alignItems: 'start' }}>
        <Panel title="Kullanıcılar & Roller">
          {USERS.map((u) => (
            <div key={u.name} className="list-row">
              <Avatar text={u.init} size="sm" />
              <div className="grow">
                <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{u.name}</div>
                <div className="muted small">{u.role}</div>
              </div>
              <Badge kind={u.on ? 'sage' : 'free'} dot={u.on ? 'var(--success)' : 'var(--muted)'}>{u.on ? 'Aktif' : 'Pasif'}</Badge>
            </div>
          ))}
        </Panel>

        <div className="grid" style={{ gap: 18 }}>
          <Panel title="Genel">
            <div className="field" style={{ marginBottom: 14 }}>
              <label>İşletme adı</label>
              <input className="input" placeholder="Örn. Oscar Seaside Hotel & Spa" />
            </div>
            <div className="grid g-2" style={{ gap: 12 }}>
              <div className="field">
                <label>Para birimi</label>
                <select className="select" defaultValue="TRY"><option>TRY</option><option>USD</option><option>EUR</option></select>
              </div>
              <div className="field">
                <label>KDV (%)</label>
                <input className="input" defaultValue="20" />
              </div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Prim para birimi</label>
              <select className="select" defaultValue="USD"><option>USD</option><option>TRY</option></select>
            </div>
            <Button icon="check" style={{ marginTop: 16 }} onClick={() => toast('Ayarlar kaydedildi')}>Kaydet</Button>
          </Panel>

          <Panel title="Rol Erişim Özeti">
            {ROLES.map((r) => {
              const I = Icon[r.icon]
              return (
                <div key={r.id} className="list-row">
                  <div className="t-ic" style={{ width: 34, height: 34, borderRadius: 10 }}><I style={{ width: 16, height: 16 }} /></div>
                  <div className="grow">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div className="muted small">{r.desc}</div>
                  </div>
                </div>
              )
            })}
          </Panel>
        </div>
      </div>

      <Panel className="section-gap" title="Entegrasyonlar">
        <div className="grid g-2">
          {INTS.map((it) => {
            const I = Icon[it.icon]
            return (
              <div key={it.id} className="card" style={{ background: 'var(--surface-2)', padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div className="t-ic"><I /></div>
                <div className="grow">
                  <div className="center gap-sm">
                    <span style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{it.name}</span>
                    <Chip kind={it.tag === 'Öncelik' ? 'gold' : ''}>{it.tag}</Chip>
                  </div>
                  <div className="muted small" style={{ marginTop: 3 }}>{it.desc}</div>
                </div>
                <Toggle on={integrations[it.id]} onChange={(v) => setIntegrations((s) => ({ ...s, [it.id]: v }))} />
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
