import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import Logo from '../components/Logo.jsx'
import Icon from '../components/icons.jsx'
import { Button } from '../components/ui.jsx'

export default function Login() {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true); setErr(false)
    try {
      const ok = await login(username, password)
      if (!ok) setErr(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <div className="login-art">
        <div className="la-brand"><Logo /></div>
        <div>
          <h1>Kendinize<br />zaman ayırın.</h1>
          <p className="la-sub">
            Spa operasyonunu, satışı ve misafir deneyimini tek panelden yönetin.
            Daha hızlı operasyon, daha yüksek doluluk, daha iyi deneyim.
          </p>
          <div className="la-pills">
            <span className="la-pill">Randevu + Takvim</span>
            <span className="la-pill">CRM + Paketler</span>
            <span className="la-pill">POS + Finans</span>
            <span className="la-pill">PMS + WhatsApp</span>
          </div>
        </div>
        <div className="la-foot">Spa işletmeleri için daha parlak bir yarın</div>
        <svg className="leaf-bg" viewBox="0 0 48 48" fill="none" aria-hidden>
          <path d="M24 42c0-11 5-19 15-24-2 12-7 20-15 24Z" fill="#fff" />
          <path d="M24 42C24 30 18 22 8 18c2 12 8 20 16 24Z" fill="#fff" />
        </svg>
      </div>

      <div className="login-form-wrap">
        <form className="login-card" onSubmit={submit}>
          <h2>Giriş yap</h2>
          <p className="lc-sub">Kullanıcı adı ve şifrenizle devam edin.</p>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Kullanıcı adı</label>
            <input className="input" autoFocus autoCapitalize="none" autoCorrect="off"
              value={username} onChange={(e) => { setUsername(e.target.value); setErr(false) }}
              placeholder="Örn. cigdem" />
          </div>

          <div className="field">
            <label>Şifre</label>
            <input className="input" type="password"
              value={password} onChange={(e) => { setPassword(e.target.value); setErr(false) }}
              placeholder="••••••••" />
          </div>

          {err && (
            <div className="login-err">
              <Icon.info /> Kullanıcı adı veya şifre hatalı.
            </div>
          )}

          <Button block type="submit" icon="chevronR" style={{ marginTop: 22 }} disabled={busy}>
            {busy ? 'Giriş yapılıyor…' : 'Panele giriş yap'}
          </Button>

          <div className="login-hint">
            <div className="lh-title">Demo hesaplar</div>
            <div className="lh-row"><b>Yönetici</b><span>cigdem / cigdem123</span></div>
            <div className="lh-row"><b>Terapist</b><span>dita / dita123</span></div>
            <div className="lh-row"><b>Terapist</b><span>sitti / sitti123</span></div>
          </div>
        </form>
      </div>
    </div>
  )
}
