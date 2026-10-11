import { useState, useRef } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Chip, Avatar, Button, Modal } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'
import { sendWhatsApp } from '../lib/wa.js'
import { spaElektraDiscover } from '../lib/elektra.js'

const initialsOf = (nm) => String(nm || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} aria-pressed={on}
      style={{ width: 46, height: 26, borderRadius: 20, border: 'none', background: on ? 'var(--sage)' : 'var(--line)', position: 'relative', transition: 'background .2s', flex: 'none' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  )
}

export default function Settings() {
  const { ROLES, toast, exportBackup, importBackup, wipeHistory, wipeAll, guests, appointments, packages, sales,
    user, therapists, FIREBASE_ENABLED, spaUsers, spaAddUser, spaUpdateUser, spaSetUserActive, spaResetPassword, spaDeleteUser, changePassword } = useStore()
  const isOwner = user?.role === 'owner'
  const roleName = (id) => (ROLES.find((r) => r.id === id) || {}).name || id
  const [uModal, setUModal] = useState(null) // { mode:'add'|'edit'|'pw', u? }
  const emptyForm = { username: '', name: '', role: 'reception', therapistId: '', password: '' }
  const [uForm, setUForm] = useState(emptyForm)
  const [uBusy, setUBusy] = useState(false)
  const setF = (k, v) => setUForm((s) => ({ ...s, [k]: v }))
  const openAdd = () => { setUForm(emptyForm); setUModal({ mode: 'add' }) }
  const openEdit = (u) => { setUForm({ username: u.username, name: u.name || '', role: u.role, therapistId: u.therapistId || '', password: '' }); setUModal({ mode: 'edit', u }) }
  const openPw = (u) => { setUForm({ ...emptyForm, username: u.username, name: u.name || '' }); setUModal({ mode: 'pw', u }) }
  const closeU = () => { if (!uBusy) setUModal(null) }
  const submitAdd = async () => {
    setUBusy(true)
    const r = await spaAddUser({ username: uForm.username, name: uForm.name, role: uForm.role, therapistId: uForm.therapistId, password: uForm.password })
    setUBusy(false)
    if (r.ok) setUModal(null); else toast(r.error || 'Eklenemedi', 'warn')
  }
  const submitEdit = async () => {
    setUBusy(true)
    const patch = { name: uForm.name.trim(), role: uForm.role, therapistId: uForm.role === 'therapist' ? (uForm.therapistId || null) : null }
    const r = await spaUpdateUser(uModal.u.username, patch)
    setUBusy(false)
    if (r.ok) { toast('Kullanıcı güncellendi ✓'); setUModal(null) } else toast(r.error || 'Güncellenemedi', 'warn')
  }
  const submitPw = async () => {
    if (String(uForm.password || '').length < 6) { toast('Şifre en az 6 karakter olmalı', 'warn'); return }
    setUBusy(true)
    const isSelf = String(uModal.u.username).toLowerCase() === String(user?.username).toLowerCase()
    const r = isSelf ? await changePassword(uForm.password) : await spaResetPassword(uModal.u.username, uForm.password)
    setUBusy(false)
    if (r.ok) setUModal(null); else toast(r.error || 'Şifre güncellenemedi', 'warn')
  }
  const onToggleActive = async (u) => {
    const isActive = u.active !== false
    if (isActive && u.username.toLowerCase() === 'cigdem') { toast('Ana yönetici pasife alınamaz', 'warn'); return }
    await spaSetUserActive(u.username, !isActive)
  }
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
  const [elk, setElk] = useState(null)
  const [elkBusy, setElkBusy] = useState(false)
  const onElkDiscover = async () => {
    setElkBusy(true)
    const r = await spaElektraDiscover()
    setElkBusy(false)
    setElk(r)
    if (!r || r.ok === false) toast('Elektra keşif: ' + ((r && (r.error || (r.disabled ? 'elektra pasif' : ''))) || 'hata'), 'warn')
    else toast('Elektra keşif tamam')
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
        <Panel title="Kullanıcılar & Roller" action={isOwner ? <Button sm icon="plus" onClick={openAdd}>Yeni kullanıcı</Button> : null}>
          {(spaUsers || []).map((u) => {
            const active = u.active !== false
            const self = String(u.username).toLowerCase() === String(user?.username).toLowerCase()
            return (
              <div key={u.username} className="list-row">
                <Avatar text={initialsOf(u.name)} size="sm" />
                <div className="grow">
                  <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>{u.name} {self && <span className="muted small">(siz)</span>}</div>
                  <div className="muted small">@{u.username} · {roleName(u.role)}</div>
                </div>
                <div className="center gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Badge kind={active ? 'sage' : 'free'} dot={active ? 'var(--success)' : 'var(--muted)'}>{active ? 'Aktif' : 'Pasif'}</Badge>
                  {isOwner && <Button sm variant="ghost" onClick={() => openEdit(u)}>Düzenle</Button>}
                  {(isOwner || self) && <Button sm variant="ghost" onClick={() => openPw(u)}>Şifre</Button>}
                  {isOwner && <Button sm variant="ghost" onClick={() => onToggleActive(u)}>{active ? 'Pasif yap' : 'Aktif yap'}</Button>}
                </div>
              </div>
            )
          })}
          {!FIREBASE_ENABLED && <div className="muted small" style={{ marginTop: 10 }}>Bulut kapalı — kullanıcı yönetimi için çevrimiçi (Firebase) mod gerekir.</div>}
          {isOwner && <div className="muted small" style={{ marginTop: 10, lineHeight: 1.5 }}>
            <b>Yeni kullanıcı</b> ile hesap açar, <b>Düzenle</b> ile ad/rol değiştirir, <b>Pasif yap</b> ile girişi engellersiniz.
            <b> Şifre</b> ile kendi şifrenizi (ve kurulum tamamlandıysa diğer kullanıcıların şifresini) yenilersiniz.
          </div>}
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

      <Panel className="section-gap" title="Spa → Elektra (Oscar Spa Folyosu)">
        <div className="muted small" style={{ marginBottom: 12, lineHeight: 1.5 }}>
          Ödeme alınınca (Nakit / Kredi Kartı / Havale) adisyon otomatik olarak Elektra'da <b>Oscar Spa</b> folyosuna işlenir
          (harcama + ödeme). Aşağıdaki buton, Elektra'daki folyo ve ödeme kodlarının doğru çözüldüğünü kontrol eder.
        </div>
        <Button icon="pms" variant="ghost" disabled={elkBusy} onClick={onElkDiscover}>{elkBusy ? 'Kontrol ediliyor…' : 'Elektra Kodlarını Kontrol Et'}</Button>
        {elk && elk.ok && elk.resolved && (
          <div className="card" style={{ background: 'var(--surface-2)', marginTop: 12, fontSize: 13 }}>
            <div className="kv"><span className="k">Oscar Spa folyo (RESID)</span><span className="v">{elk.resolved.spa_resid || '—'}</span></div>
            <div className="kv"><span className="k">Spa gelir (REVID)</span><span className="v">{elk.resolved.rev_spa || '—'}</span></div>
            <div className="kv"><span className="k">Gider merkezi (DEPKODU)</span><span className="v">{elk.resolved.dep_spa || '—'}</span></div>
            <div className="kv"><span className="k">Spa Nakit</span><span className="v">{elk.resolved.dep_spa_nakit || '—'}</span></div>
            <div className="kv"><span className="k">Spa Kredi Kartı</span><span className="v">{elk.resolved.dep_spa_kredi || '—'}</span></div>
            <div className="kv"><span className="k">Spa Havale</span><span className="v">{elk.resolved.dep_spa_havale || '—'}</span></div>
            <div className="muted small" style={{ marginTop: 8 }}>
              Spa folyo adayları: {(elk.reservations_spa || []).map((r) => `${r.name} (RESID ${r.resid})`).join(' · ') || 'bulunamadı'}
            </div>
          </div>
        )}
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

      {uModal && (uModal.mode === 'add' || uModal.mode === 'edit') && (
        <Modal
          title={uModal.mode === 'add' ? 'Yeni kullanıcı' : 'Kullanıcıyı düzenle'}
          sub={uModal.mode === 'edit' ? '@' + uModal.u.username : 'Yeni personel giriş hesabı oluşturun'}
          onClose={closeU}
          footer={<>
            <Button variant="ghost" onClick={closeU} disabled={uBusy}>Vazgeç</Button>
            <Button icon="check" onClick={uModal.mode === 'add' ? submitAdd : submitEdit} disabled={uBusy}>{uBusy ? 'Kaydediliyor…' : 'Kaydet'}</Button>
          </>}
        >
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Ad Soyad</label>
            <input className="input" value={uForm.name} onChange={(e) => setF('name', e.target.value)} placeholder="Örn. Ayşe Yılmaz" />
          </div>
          {uModal.mode === 'add' && (
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Kullanıcı adı (girişte yazılır)</label>
              <input className="input" value={uForm.username} onChange={(e) => setF('username', e.target.value.toLowerCase())} placeholder="örn. ayse" autoCapitalize="none" />
            </div>
          )}
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Rol</label>
            <select className="select" value={uForm.role} onChange={(e) => setF('role', e.target.value)}>
              {ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {uForm.role === 'therapist' && (
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Bağlı terapist (yalnızca kendi randevularını görür)</label>
              <select className="select" value={uForm.therapistId || ''} onChange={(e) => setF('therapistId', e.target.value)}>
                <option value="">— Seçiniz —</option>
                {(therapists || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          {uModal.mode === 'add' && (
            <div className="field">
              <label>Şifre (en az 6 karakter)</label>
              <input className="input" type="text" value={uForm.password} onChange={(e) => setF('password', e.target.value)} placeholder="Giriş şifresi" autoComplete="off" />
            </div>
          )}
        </Modal>
      )}

      {uModal && uModal.mode === 'pw' && (
        <Modal
          title="Şifre ver / yenile"
          sub={(uModal.u.name || '') + ' · @' + uModal.u.username}
          onClose={closeU}
          footer={<>
            <Button variant="ghost" onClick={closeU} disabled={uBusy}>Vazgeç</Button>
            <Button icon="check" onClick={submitPw} disabled={uBusy}>{uBusy ? 'Kaydediliyor…' : 'Kaydet'}</Button>
          </>}
        >
          <div className="field">
            <label>Yeni şifre (en az 6 karakter)</label>
            <input className="input" type="text" value={uForm.password} onChange={(e) => setF('password', e.target.value)} placeholder="Yeni şifre" autoComplete="off" />
          </div>
          <div className="muted small" style={{ marginTop: 8, lineHeight: 1.5 }}>
            Kullanıcı bir sonraki girişinde bu şifreyle giriş yapar.
          </div>
        </Modal>
      )}
    </div>
  )
}
