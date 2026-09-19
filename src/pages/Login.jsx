import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import Logo from '../components/Logo.jsx'
import Icon from '../components/icons.jsx'
import { Button } from '../components/ui.jsx'

export default function Login() {
  const { login, ROLES } = useStore()
  const [role, setRole] = useState('owner')
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    login(role, name)
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
            <span className="la-pill">Randevu + Spa Floor</span>
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
          <h2>Tekrar hoş geldiniz</h2>
          <p className="lc-sub">Devam etmek için rolünüzü seçin ve giriş yapın.</p>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Ad Soyad <span className="muted">(opsiyonel)</span></label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                   placeholder="Örn. Deniz Kaya" />
          </div>

          <div className="field">
            <label>Rol seçimi</label>
            <div className="role-grid">
              {ROLES.map((r) => {
                const I = Icon[r.icon]
                return (
                  <button type="button" key={r.id}
                    className={`role-pick ${role === r.id ? 'on' : ''}`}
                    onClick={() => setRole(r.id)}>
                    <I />
                    <div>
                      <div className="rp-t">{r.name.split(' / ')[0]}</div>
                      <div className="rp-s">{r.desc.split(',')[0]}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="field" style={{ marginTop: 18 }}>
            <label>Şifre</label>
            <input className="input" type="password" defaultValue="••••••••" />
          </div>

          <Button block type="submit" icon="chevronR" style={{ marginTop: 22 }}>
            Panele giriş yap
          </Button>
          <p className="muted small" style={{ textAlign: 'center', marginTop: 16 }}>
            Demo giriş — herhangi bir rol ile devam edebilirsiniz.
          </p>
        </form>
      </div>
    </div>
  )
}
