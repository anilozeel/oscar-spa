import { useState, useRef } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Chip, Avatar, Button } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'
import { sendWhatsApp } from '../lib/wa.js'

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
  const { ROLES, toast, exportBackup, importBackup, wipeHistory, wipeAll, guests, appointments, packages, sales } = useStore()
  const [integrations, setIntegrations] = useState({ pms: true, whatsapp: true, online: false, ai: false })
  const fileRef = useRef(null)
  const [waPhone, setWaPhone] = useState('')
  const [waBusy, setWaBusy] = useState(false)
  const onWaTest = async () => {
    const to = waPhone.trim()
    if (!to) { toast('Numara girin', 'warn'); return }
    setWaBusy(true)
    const r = await sendWhatsApp(to, 'Oscar Spa test mesajı ✅ WhatsApp entegrasyonu çalışıyor.')
    setWaBusy(false)
    if (r.ok) toast('WhatsApp gönderildi ✅')
    else toast('Gönderilemedi: ' + (r.detail || r.error || 'bilinmeyen'), 'warn')
  }
  const onWipeHistory = () => {
    if (window.confirm('Tüm geçmiş (randevular, satışlar, paketler) silinecek. Primler ve misafir listesi KORUNUR. Devam edilsin mi?')
      && window.confirm('Emin misiniz? Bu işlem geri alınamaz.')) wipeHistory()
  }
  const onWipeAll = () => {
    if (window.confirm('TÜM veriler — primler ve misafirler dahil — silinip sistem sıfırlanacak. Devam edilsin mi?')
      && window.confirm('Son uyarı: primler de dahil HER ŞEY silinecek. Geri alınamaz!')) wipeAll()
  }
  const onRestoreFile = (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ''
    if (!f) return
    if (!window.confirm('Seçilen yedek dosyasındaki kayıtlar buluta geri yüklenecek (aynı kimlikli kayıtların üzerine yazar). Devam edilsin mi?')) return
    const reader = new FileReader()
    reader.onload = () => { try { importBackup(JSON.parse(reader.result)) } catch { toast('Dosya okunamadı', 'warn') } }
    reader.onerror = () => toast('Dosya okunamadı', 'warn')
    reader.readAsText(f)
  }

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

      <Panel className="section-gap" title="WhatsApp (Twilio) — Test">
        <div className="muted small" style={{ marginBottom: 12, lineHeight: 1.5 }}>
          Randevu oluşturulunca <b>terapiste</b> ve (numarası varsa) <b>müşteriye</b> otomatik WhatsApp gider.
          Buradan bir test mesajı gönderebilirsiniz. <b>Sandbox</b> aşamasında yalnızca bota <b>join</b> yazıp katılan
          numaralar mesaj alır (Dita, Sitti ve siz).
        </div>
        <div className="center gap-sm" style={{ flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 220 }} type="tel" placeholder="05xx xxx xx xx"
            value={waPhone} onChange={(e) => setWaPhone(e.target.value)} />
          <Button icon="whatsapp" disabled={waBusy} onClick={onWaTest}>{waBusy ? 'Gönderiliyor…' : 'Test WhatsApp Gönder'}</Button>
        </div>
      </Panel>

      <Panel className="section-gap" title="Yedekleme">
        <div className="muted small" style={{ marginBottom: 12, lineHeight: 1.5 }}>
          Tüm veriler (misafirler, randevular, paketler, satışlar, primler) Firestore bulutunda tutulur ve cihazlar arası senkrondur.
          Ekstra güvenlik için — kazara silme / yanlışlıkla değişiklik ihtimaline karşı — dilediğin zaman tam yedeği indirip saklayabilirsin
          (bilgisayar, Google Drive vb.). Haftada bir indirmen önerilir.
        </div>
        <div className="center gap-sm" style={{ flexWrap: 'wrap' }}>
          <Button icon="shield" onClick={exportBackup}>Yedek Al (indir)</Button>
          <Button variant="ghost" onClick={() => fileRef.current && fileRef.current.click()}>Yedekten Geri Yükle</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onRestoreFile} />
        </div>
        <div className="muted small" style={{ marginTop: 12 }}>
          Mevcut veri: <b>{guests.length}</b> misafir · <b>{appointments.length}</b> randevu · <b>{packages.length}</b> paket · <b>{sales.length}</b> satış
        </div>
      </Panel>

      <Panel className="section-gap" title="Sıfırlama (Tehlikeli Bölge)">
        <div className="muted small" style={{ marginBottom: 12, lineHeight: 1.5 }}>
          Bu işlemler <b>geri alınamaz</b>. Önce üstteki <b>Yedek Al</b> ile tam yedek indirmeniz önerilir.
          <b> Primler</b> (terapist hak edişleri) yalnızca “Her Şeyi Sıfırla” ile silinir; “Geçmişi Sil”de <b>korunur</b>.
        </div>
        <div className="center gap-sm" style={{ flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={onWipeHistory}>Geçmişi Sil (randevu · satış · paket)</Button>
          <Button variant="ghost" style={{ color: 'var(--danger)', borderColor: '#e3b7b0' }} onClick={onWipeAll}>Her Şeyi Sıfırla (primler &amp; misafirler dahil)</Button>
        </div>
      </Panel>
    </div>
  )
}
