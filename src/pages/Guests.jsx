import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Chip, Avatar, Button, Modal } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function Guests() {
  const { guests, addGuest, appointments, fmtTRY } = useStore()
  const nav = useNavigate()
  const [sel, setSel] = useState(guests[0]?.id || null)
  const [q, setQ] = useState('')
  const [add, setAdd] = useState(false)

  const list = guests.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()) || (x.phone || '').includes(q))
  const g = guests.find((x) => x.id === sel) || guests[0] || null
  const history = g ? appointments.filter((a) => a.guestId === g.id) : []
  const totalVisits = history.length
  const totalSpend = history.filter((a) => a.status === 'done').reduce((s, a) => s + (a.price || 0), 0)
  const lastVisit = history.length ? [...history].sort((a, b) => b.time.localeCompare(a.time))[0].time : '—'

  return (
    <div className="page">
      <PageHead title="Misafirler (CRM)" sub="Misafir kayıtları, iletişim ve geçmiş işlemler."
        action={<Button icon="plus" onClick={() => setAdd(true)}>Yeni Misafir</Button>} />

      {guests.length === 0 ? (
        <Panel title="Misafirler">
          <div className="empty"><Icon.guests /><div>Henüz misafir kaydı yok.<br />“Yeni Misafir” ile ekleyin; randevu oluşturdukça da otomatik eklenir.</div></div>
        </Panel>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
          <Panel title="Misafirler" action={<Chip>{guests.length}</Chip>}>
            <div className="top-search" style={{ maxWidth: 'none', marginBottom: 12 }}>
              <Icon.search /><input placeholder="Ad veya telefon ara..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div>
              {list.map((x) => (
                <button key={x.id} onClick={() => setSel(x.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', textAlign: 'left', background: (g && g.id === x.id) ? 'var(--sage-tint)' : 'none', padding: '10px', borderRadius: 12, marginBottom: 2 }}>
                  <Avatar text={x.initials} size="sm" gold={x.vip} />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{x.name}</div>
                    <div className="muted small">{x.phone || '—'}</div>
                  </div>
                  {x.vip && <Badge kind="vip">VIP</Badge>}
                </button>
              ))}
              {!list.length && <p className="muted small">Eşleşen misafir yok.</p>}
            </div>
          </Panel>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1.1fr', alignItems: 'start' }}>
            <Panel title="Misafir Profili">
              {g && (
                <>
                  <div className="center" style={{ gap: 16, marginBottom: 18 }}>
                    <Avatar text={g.initials} size="lg" gold={g.vip} />
                    <div>
                      <div className="display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--forest)' }}>{g.name}</div>
                      <div className="center gap-sm" style={{ marginTop: 6 }}>{g.vip && <Badge kind="vip">VIP</Badge>}<span className="muted small">{g.phone || '—'}</span></div>
                    </div>
                  </div>
                  <div className="kv"><span className="k">Telefon</span><span className="v">{g.phone || '—'}</span></div>
                  <div className="kv"><span className="k">Toplam ziyaret</span><span className="v">{totalVisits}</span></div>
                  <div className="kv"><span className="k">Toplam harcama</span><span className="v money">{fmtTRY(totalSpend)}</span></div>
                  <div className="kv"><span className="k">Son işlem</span><span className="v">{lastVisit}</span></div>
                  {g.prefs?.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      <div style={{ fontWeight: 600, marginBottom: 10 }}>Tercihler</div>
                      <div className="center wrap gap-sm">{g.prefs.map((p) => <Chip key={p}>{p}</Chip>)}</div>
                    </div>
                  )}
                  {g.notes && (
                    <div style={{ marginTop: 18 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Not</div>
                      <div className="card" style={{ background: 'var(--surface-2)', fontSize: 13.5, color: 'var(--ink-2)' }}>{g.notes}</div>
                    </div>
                  )}
                  <Button block variant="ghost" icon="calendar" style={{ marginTop: 18 }} onClick={() => nav('/randevular')}>Yeni Randevu Aç</Button>
                </>
              )}
            </Panel>

            <Panel title="Geçmiş işlemler" action={<Chip>{history.length}</Chip>}>
              {history.length ? [...history].sort((a, b) => a.time.localeCompare(b.time)).map((h) => (
                <div key={h.id} className="list-row">
                  <div className="chip ghost" style={{ minWidth: 62, justifyContent: 'center' }}>{h.time}</div>
                  <div className="grow">
                    <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{h.service}</div>
                    <div className="muted small">{h.therapist || 'Terapistsiz'}</div>
                  </div>
                  <div className="money">{h.price ? fmtTRY(h.price) : '₺0'}</div>
                </div>
              )) : <p className="muted small">Bu misafir için kayıt yok.</p>}
            </Panel>
          </div>
        </div>
      )}

      {add && <NewGuest onClose={() => setAdd(false)} addGuest={addGuest} onAdded={(id) => setSel(id)} />}
    </div>
  )
}

function NewGuest({ onClose, addGuest, onAdded }) {
  const [f, setF] = useState({ name: '', phone: '', vip: false, notes: '' })
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const valid = f.name.trim() && f.phone.replace(/\D/g, '').length >= 7
  const save = () => { const g = addGuest(f); if (g) { onAdded?.(g.id); onClose() } }
  return (
    <Modal title="Yeni Misafir" sub="Yeni misafir kaydı oluşturun." onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
        <Button icon="check" disabled={!valid} onClick={save}>Kaydet</Button>
      </>}>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Ad Soyad <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input className="input" autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Örn. Ahmet Yılmaz" />
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Telefon <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input className="input" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="05xx xxx xx xx" />
      </div>
      <label className="center gap-sm small" style={{ cursor: 'pointer', marginBottom: 14 }}>
        <input type="checkbox" checked={f.vip} onChange={(e) => set('vip', e.target.checked)} /> VIP misafir
      </label>
      <div className="field">
        <label>Not</label>
        <textarea className="input" value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Tercihler, hassasiyetler..." />
      </div>
      {!valid && <p className="small" style={{ color: 'var(--gold-deep)', marginTop: 10 }}>Ad ve geçerli telefon gerekli.</p>}
    </Modal>
  )
}
