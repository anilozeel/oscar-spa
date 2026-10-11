// ---------------------------------------------------------------------------
// OscarSpa — Cloud Functions
// sendAssignmentPush: bir randevu bir terapiste atandığında, o terapistin
// kayıtlı cihaz(lar)ına FCM push bildirimi gönderir (uygulama kapalıyken de).
// ---------------------------------------------------------------------------
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')
const { getAuth } = require('firebase-admin/auth')

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 })

initializeApp()
const db = getFirestore()

const AUTH_EMAIL_SUFFIX = '@oscarspa.app'
// Yalnızca bu kullanıcı adları admin işlemleri (şifre sıfırlama / kalıcı silme) yapabilir.
// GÜVENLİK: appusers.role'e GÜVENİLMEZ — Firestore kuralları her girişli kullanıcının
// o koleksiyona yazmasına izin verdiğinden rol üzerinden yetki yükseltme mümkün olur.
// Yeni bir yönetici eklemek için bu listeye kullanıcı adını ekleyip fonksiyonu yeniden dağıtın.
const OWNER_USERNAMES = ['cigdem']

function assertOwner(req) {
  if (!req.auth || !req.auth.token || !req.auth.token.email) {
    throw new HttpsError('unauthenticated', 'Giriş gerekli.')
  }
  const uname = String(req.auth.token.email).split('@')[0].toLowerCase()
  if (OWNER_USERNAMES.includes(uname)) return uname
  throw new HttpsError('permission-denied', 'Bu işlem için yönetici yetkisi gerekli.')
}

// Yönetici: başka bir kullanıcının şifresini yeniler.
exports.adminSetUserPassword = onCall(async (req) => {
  await assertOwner(req)
  const username = String((req.data && req.data.username) || '').trim().toLowerCase()
  const password = String((req.data && req.data.password) || '')
  if (!username) throw new HttpsError('invalid-argument', 'Kullanıcı adı gerekli.')
  if (password.length < 6) throw new HttpsError('invalid-argument', 'Şifre en az 6 karakter olmalı.')
  const email = username + AUTH_EMAIL_SUFFIX
  let userRec
  try { userRec = await getAuth().getUserByEmail(email) }
  catch { throw new HttpsError('not-found', 'Kullanıcı bulunamadı.') }
  await getAuth().updateUser(userRec.uid, { password })
  try { await db.collection('appusers').doc(username).set({ pwChanged: true, at: Date.now() }, { merge: true }) } catch { /* yoksay */ }
  return { ok: true }
})

// Yönetici: bir kullanıcıyı tamamen siler (Auth hesabı + roster kaydı).
exports.adminDeleteUser = onCall(async (req) => {
  await assertOwner(req)
  const username = String((req.data && req.data.username) || '').trim().toLowerCase()
  if (!username) throw new HttpsError('invalid-argument', 'Kullanıcı adı gerekli.')
  if (OWNER_USERNAMES.includes(username)) throw new HttpsError('permission-denied', 'Bu kullanıcı silinemez.')
  const email = username + AUTH_EMAIL_SUFFIX
  try { const u = await getAuth().getUserByEmail(email); await getAuth().deleteUser(u.uid) } catch { /* Auth kaydı yoksa yoksay */ }
  try { await db.collection('appusers').doc(username).delete() } catch { /* yoksay */ }
  return { ok: true }
})

exports.sendAssignmentPush = onCall(async (req) => {
  // Sadece giriş yapmış personel çağırabilir
  if (!req.auth) throw new HttpsError('unauthenticated', 'Giriş gerekli.')

  const { therapistId, time, service, guest, apptId } = req.data || {}
  if (!therapistId) return { sent: 0, reason: 'no-therapist' }

  // Terapistin kayıtlı cihaz token'ları
  const snap = await db.collection('deviceTokens').where('therapistId', '==', therapistId).get()
  const tokens = snap.docs.map((d) => d.get('token')).filter(Boolean)
  if (!tokens.length) return { sent: 0, reason: 'no-tokens' }

  const body = `${time ? time + ' • ' : ''}${service || 'Randevu'}${guest ? ' — ' + guest : ''}`
  const message = {
    tokens,
    notification: { title: 'Yeni randevunuz var', body },
    android: {
      priority: 'high',
      notification: { channelId: 'oscarspa', sound: 'default', defaultSound: true },
    },
    data: { type: 'appointment', apptId: String(apptId || '') },
  }

  const res = await getMessaging().sendEachForMulticast(message)

  // Geçersiz/silinmiş token'ları temizle
  const cleanups = []
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = (r.error && r.error.code) || ''
      if (
        code.includes('registration-token-not-registered') ||
        code.includes('invalid-registration-token') ||
        code.includes('invalid-argument')
      ) {
        cleanups.push(db.collection('deviceTokens').doc(tokens[i]).delete().catch(() => {}))
      }
    }
  })
  await Promise.all(cleanups)

  return { sent: res.successCount, failed: res.failureCount }
})
