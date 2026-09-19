import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Chip, Avatar, Button } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const AUTOMATIONS = [
  { t: 'Randevu hatırlatma', s: 'WhatsApp ile 2 saat önce otomatik mesaj', icon: 'whatsapp' },
  { t: 'İşlem sonrası feedback', s: '5 yıldız ise Google yorum yönlendirmesi', icon: 'star' },
  { t: 'Düşük puan yönetimi', s: '1-3 yıldızda iç şikayet formu açılması', icon: 'shield' },
  { t: 'Sadakat önerisi', s: 'Son 30 gündür gelmeyen misafire kampanya', icon: 'heart' },
  { t: 'Kişisel notlar', s: 'Masaj basıncı, hassas bölge, terapist tercihi', icon: 'edit' },
]

export default function Guests() {
  const { guests, fmtTRY, appointments } = useStore()
  const [sel, setSel] = useState(guests[0].id)
  const [q, setQ] = useState('')
  const g = guests.find((x) => x.id === sel)
  const list = guests.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()))
  const history = appointments.filter((a) => a.guestId === sel)

  return (
    <div className="page">
      <PageHead title="Misafir CRM ve Deneyim" sub="Spa deneyimini kişiselleştirmek için her misafirin tercihleri ve geçmişi saklanmalı." />

      <div className="grid" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
        {/* List */}
        <Panel title="Misafirler" action={<Chip>{guests.length}</Chip>}>
          <div className="top-search" style={{ maxWidth: 'none', marginBottom: 12 }}>
            <Icon.search /><input placeholder="Misafir ara..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            {list.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', textAlign: 'left', background: sel === x.id ? 'var(--sage-tint)' : 'none', padding: '10px 10px', borderRadius: 12, marginBottom: 2 }}>
                <Avatar text={x.initials} size="sm" gold={x.vip} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{x.name}</div>
                  <div className="muted small">Oda {x.roomNo} · {x.totalVisits} ziyaret</div>
                </div>
                {x.vip && <Badge kind="vip">VIP</Badge>}
              </button>
            ))}
          </div>
        </Panel>

        {/* Detail */}
        <div className="grid" style={{ gridTemplateColumns: '1fr 1.1fr', alignItems: 'start' }}>
          <Panel title="Misafir Profili">
            <div className="center" style={{ gap: 16, marginBottom: 18 }}>
              <Avatar text={g.initials} size="lg" gold={g.vip} />
              <div>
                <div className="display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--forest)' }}>{g.name}</div>
                <div className="center gap-sm" style={{ marginTop: 6 }}>
                  {g.vip && <Badge kind="vip">VIP</Badge>}
                  <span className="muted small">{g.phone}</span>
                </div>
              </div>
            </div>
            <div className="kv"><span className="k">Son ziyaret</span><span className="v">{g.lastVisit}</span></div>
            <div className="kv"><span className="k">Toplam ziyaret</span><span className="v">{g.totalVisits}</span></div>
            <div className="kv"><span className="k">Toplam harcama</span><span className="v money">{fmtTRY(g.totalSpend)}</span></div>
            <div className="kv"><span className="k">Favori terapist</span><span className="v">{g.favTherapist}</span></div>
            <div className="kv"><span className="k">Oda no</span><span className="v">{g.roomNo}</span></div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Tercihler</div>
              <div className="center wrap gap-sm">
                {g.prefs.map((p) => <Chip key={p}>{p}</Chip>)}
              </div>
            </div>
            {g.notes && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Kişisel not</div>
                <div className="card" style={{ background: 'var(--surface-2)', fontSize: 13.5, color: 'var(--ink-2)' }}>{g.notes}</div>
              </div>
            )}
            <Button block variant="ghost" icon="calendar" style={{ marginTop: 18 }}>Yeni Randevu Aç</Button>
          </Panel>

          <div className="grid" style={{ gap: 18 }}>
            <Panel title="Deneyim otomasyonları">
              {AUTOMATIONS.map((a) => {
                const I = Icon[a.icon]
                return (
                  <div key={a.t} className="list-row">
                    <div className="t-ic" style={{ width: 38, height: 38, borderRadius: 11 }}><I style={{ width: 18, height: 18 }} /></div>
                    <div className="grow">
                      <div style={{ fontWeight: 600, color: 'var(--forest-ink)', fontSize: 14 }}>{a.t}</div>
                      <div className="muted small">{a.s}</div>
                    </div>
                  </div>
                )
              })}
            </Panel>

            <Panel title="Geçmiş işlemler" action={<Chip>{history.length}</Chip>}>
              {history.length ? history.map((h) => (
                <div key={h.id} className="list-row">
                  <div className="chip ghost" style={{ minWidth: 62, justifyContent: 'center' }}>{h.time}</div>
                  <div className="grow">
                    <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{h.service}</div>
                    <div className="muted small">{h.therapist || 'Terapistsiz'} · {h.room}</div>
                  </div>
                  <div className="money">{h.price ? fmtTRY(h.price) : '₺0'}</div>
                </div>
              )) : <p className="muted small">Bu misafir için bugün kayıt yok.</p>}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
