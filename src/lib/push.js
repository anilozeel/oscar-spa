// ---------------------------------------------------------------------------
// OscarSpa — Gerçek push bildirimi (FCM)
// ---------------------------------------------------------------------------
// registerPush(): sadece native (APK) — izin ister, FCM token'ı alır ve
//   Firestore'daki deviceTokens koleksiyonuna (terapist eşlemesiyle) yazar.
// sendAssignmentPush(): web+native — bir randevu bir terapiste atandığında,
//   o terapistin telefon(lar)ına bildirim gönderen Cloud Function'ı çağırır.
// ---------------------------------------------------------------------------
import { Capacitor } from '@capacitor/core'
import { db, functions } from './firebase.js'
import { doc, setDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

const isNative = () => { try { return Capacitor.isNativePlatform() } catch { return false } }

let currentUser = null
let listenersSet = false

// APK'da: izin + token kaydı
export async function registerPush(userInfo) {
  if (!db || !isNative()) return // sadece Firebase + APK
  currentUser = userInfo
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return

    if (!listenersSet) {
      listenersSet = true
      PushNotifications.addListener('registration', async (t) => {
        if (!currentUser || !t?.value) return
        try {
          await setDoc(doc(db, 'deviceTokens', t.value), {
            token: t.value,
            uid: currentUser.uid || null,
            therapistId: currentUser.therapistId || null,
            role: currentUser.role || null,
            name: currentUser.name || null,
            platform: Capacitor.getPlatform(),
            updatedAt: Date.now(),
          })
          // eslint-disable-next-line no-console
          console.info('[OscarSpa] push token kaydedildi')
        } catch (e) { console.warn('[OscarSpa] token kaydı hatası', e) }
      })
      PushNotifications.addListener('registrationError', (e) => console.warn('[OscarSpa] push kayıt hatası', e))
      PushNotifications.addListener('pushNotificationReceived', () => { /* foreground: OS bildirimi zaten gelir */ })
      PushNotifications.addListener('pushNotificationActionPerformed', () => { /* tıklama */ })
    }
    await PushNotifications.register()
  } catch (e) {
    console.warn('[OscarSpa] push init hatası', e)
  }
}

// Randevu atandığında terapistin telefonuna bildirim gönder (fire-and-forget)
export async function sendAssignmentPush({ therapistId, time, service, guest, apptId }) {
  if (!functions || !therapistId) return
  try {
    const call = httpsCallable(functions, 'sendAssignmentPush')
    await call({ therapistId, time: time || '', service: service || '', guest: guest || '', apptId: apptId || '' })
  } catch (e) {
    console.warn('[OscarSpa] push gönderilemedi', e?.message || e)
  }
}
