import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Chip, Avatar, Button, Modal } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const norm = (s) => String(s || '').trim().toLocaleLowerCase('tr')

export default function Guests() {
  const { guests, addGuest, sales, fmtTRY } = useStore()
  const nav = useNavigate()
  const [detail, setDetail] = useState(null)   // açılan misafirin id'si
  const [q, setQ] = useState('')
  const [add, setAdd] = useState(false)

  // Misafir başına özet (ziyaret / harcama / son işlem) — adisyonlardan ada göre
  const statByName = useMemo(() => {
    const m = {}
    for (const s of sales) {
      const key = norm(s.guest)
      if (!key) continue
      const e = m[key] || { visits: 0, spend: 0, last: '' }
      e.visits += 1
      e.spend += Number(s.amount) || 0
      const d = String(s.date || '').slice(0, 10)
      if (d > e.last) e.last = d
      m[key] = e
    }
    return m
  }, [sales])

  const statFor = (g) => statByName[norm(g.name)] || { visits: 0, spend: 0, last: '' }

  const list = useMemo(() => {
    const qq = norm(q)
    return guests
      .filter((x) => norm(x.name).includes(qq) || String(x.phone || '').includes(q.trim()))
      .sort((a, b) => norm(a.name).localeCompare(norm(b.name), 'tr'))
  }, [guests, q])

  const g = guests.find((x) => x.id === detail) || null
  const history = g ? sales.filter((s) => norm(s.guest) === norm(g.name)) : []

  return (
    <div className="page">
      <PageHead title="Misafirler (CRM)" sub="Misafir kayıtları, iletişim ve geçmiş işlemler."
        action={<Button icon="plus" onClick={() => setAdd(true)}>Yeni Misafir</Button>} />

      {guests.length === 0 ? (
        <Panel title="Misafirler">
          <div className="empty"><Icon.guests /><div>Henüz misafir kaydı yok.<br />“Yeni Misafir” ile ekleyin; randevu oluşturdukça da otomatik eklenir.</div></div>
        </Panel>
      ) : (
        <Panel title="Misafirler" action={<Chip>{guests.length}</Chip>}>
          <div className="top-search" style={{ maxWidth: 'none', marginBottom: 14 }}>
            <Icon.search /><input placeholder="Ad veya telefon ara..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Misafir</th>
                  <th>Telefon</th>
                  <th className="num">Ziyaret</th>
                  <th className="num">Toplam Harcama</th>
                  <th>Son İşlem</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((x) => {
                  const st = statFor(x)
                  return (
                    <tr key={x.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(x.id)}>
                      <td>
                        <div className="center" style={{ gap: 10 }}>
                          <Avatar text={x.initials} size="sm" gold={x.vip} />
                          <span style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{x.name}</span>
                          {x.vip && <Badge kind="vip">VIP</Badge>}
                        </div>
                      </td>
                      <td className="nowrap">{x.phone || '—'}</td>
                      <td className="num">{st.visits}</td>
                      <td className="num money">{st.spend ? fmtTRY(st.spend) : '—'}</td>
                      <td className="nowrap">{st.last || '—'}</td>
                      <td className="num"><Icon.chevronR style={{ width: 18, height: 18, color: 'var(--muted)' }} /></td>
                    </tr>
                  )
                })}
                {!list.length && (
                  <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 28 }}>Eşleşen misafir yok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {g && (
        <GuestDetail g={g} history={history} fmtTRY={fmtTRY} onClose={() => setDetail(null)}
          onNewAppt={() => { setDetail(null); nav('/randevular') }} />
      )}

      {add && <NewGuest onClose={() => setAdd(false)} addGuest={addGuest} onAdded={(id) => setDetail(id)} />}
    </div>
  )
}

// ---- Misafir detay (profil + geçmiş işlemler) -------------------------------
function GuestDetail({ g, history, fmtTRY, onClose, onNewAppt }) {
  const totalVisits = history.length
  const totalSpend = history.reduce((s, x) => s + (Number(x.amount) || 0), 0)
  const lastVisit = history.length ? [...history].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0].date : '—'

  return (
    <Modal title="Misafir Profili" sub={g.phone || ''} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Kapat</Button>
        <Button icon="calendar" onClick={onNewAppt}>Yeni Randevu Aç</Button>
      </>}>
      <div className="center" style={{ gap: 16, marginBottom: 18 }}>
        <Avatar text={g.initials} size="lg" gold={g.vip} />
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--forest)' }}>{g.name}</div>
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

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
        <div className="between" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>Geçmiş işlemler</div><Chip>{history.length}</Chip>
        </div>
        {history.length ? [...history].sort((a, b) => String(b.date).localeCompare(String(a.date))).map((h) => (
          <div key={h.id} className="list-row">
            <div className="chip ghost" style={{ minWidth: 86, justifyContent: 'center' }}>{h.date || '—'}</div>
            <div className="grow">
              <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{h.service}</div>
              <div className="muted small">{h.therapist || 'Terapistsiz'}</div>
            </div>
            <div className="money">{h.amount ? fmtTRY(h.amount) : '₺0'}</div>
          </div>
        )) : <p className="muted small">Bu misafir için kayıt yok.</p>}
      </div>
    </Modal>
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
