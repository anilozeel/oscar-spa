// ---------------------------------------------------------------------------
// Kullanıcı yönetimi — yeni Firebase Auth hesabı oluşturma (tarayıcıdan)
// ---------------------------------------------------------------------------
// Identity Toolkit REST `accounts:signUp` uç noktası public apiKey ile çağrılır
// (Firebase JS SDK de aynı uç noktayı kullanır; mkuser.yml iş akışıyla aynıdır).
// ÖNEMLİ: ham fetch ile çağrıldığı için SDK oturumunu (giriş yapan yöneticiyi)
// DEĞİŞTİRMEZ — dönen token kullanılmaz (returnSecureToken:false).
// ---------------------------------------------------------------------------
import { firebaseConfig, AUTH_EMAIL_SUFFIX } from './firebaseConfig.js'

export async function signUpAuthUser(username, password) {
  const key = firebaseConfig.apiKey
  if (!key) return { ok: false, error: 'firebase-yok' }
  const email = String(username || '').trim().toLowerCase() + AUTH_EMAIL_SUFFIX
  try {
    const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    })
    const j = await res.json().catch(() => ({}))
    if (res.ok) return { ok: true, email }
    const code = (j && j.error && j.error.message) || 'HATA'
    if (code === 'EMAIL_EXISTS') return { ok: false, error: 'EMAIL_EXISTS' }
    if (code.indexOf('WEAK_PASSWORD') >= 0) return { ok: false, error: 'Şifre en az 6 karakter olmalı' }
    if (code.indexOf('OPERATION_NOT_ALLOWED') >= 0) return { ok: false, error: 'E-posta/şifre girişi kapalı' }
    return { ok: false, error: code }
  } catch {
    return { ok: false, error: 'ağ-hatası' }
  }
}
