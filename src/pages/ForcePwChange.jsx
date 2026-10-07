import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import Icon from '../components/icons.jsx'
import { Button } from '../components/ui.jsx'

export default function ForcePwChange() {
  const { user, changePassword, logout } = useStore()
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setErr('')
    if (p1.length < 6) { setErr('Şifre en az 6 karakter olmalı.'); return }
    if (p1 !== p2) { setErr('Şifreler eşleşmiyor.'); return }
    setBusy(true)
    const r = await changePassword(p1)
    setBusy(false)
    if (!r.ok) setErr(r.error || 'Şifre güncellenemedi.')
  }

  return (
    <div className="login">
      <div className="login-form-wrap" style={{ margin: '0 auto' }}>
        <form className="login-card" onSubmit={submit}>
          <h2>Şifrenizi belirleyin</h2>
          <p className="lc-sub">
            Merhaba {user?.name || ''}. Güvenliğiniz için ilk girişte yeni bir şifre belirlemeniz gerekiyor.
          </p>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Yeni şifre</label>
            <input className="input" type="password" autoFocus
              value={p1} onChange={(e) => { setP1(e.target.value); setErr('') }}
              placeholder="En az 6 karakter" />
          </div>
          <div className="field">
            <label>Yeni şifre (tekrar)</label>
            <input className="input" type="password"
              value={p2} onChange={(e) => { setP2(e.target.value); setErr('') }}
              placeholder="••••••••" />
          </div>

          {err && (
            <div className="login-err"><Icon.info /> {err}</div>
          )}

          <Button block type="submit" icon="check" style={{ marginTop: 22 }} disabled={busy}>
            {busy ? 'Kaydediliyor…' : 'Şifreyi kaydet ve devam et'}
          </Button>
          <button type="button" onClick={logout}
            style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', width: '100%', fontSize: 13 }}>
            Çıkış yap
          </button>
        </form>
      </div>
    </div>
  )
}
