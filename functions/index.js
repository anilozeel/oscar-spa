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

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 })

initializeApp()
const db = getFirestore()

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
