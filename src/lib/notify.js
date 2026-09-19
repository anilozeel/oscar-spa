// OscarSpa — bildirim yardımcısı
// Native (APK): Capacitor Local Notifications ile gerçek Android bildirimi + hatırlatma.
// Web/PWA: tarayıcı Notification API (izin verilmişse).
import { Capacitor } from '@capacitor/core'

const isNative = () => {
  try { return Capacitor.isNativePlatform() } catch { return false }
}

let webAsked = false

export async function ensurePermission() {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      let p = await LocalNotifications.checkPermissions()
      if (p.display !== 'granted') p = await LocalNotifications.requestPermissions()
      return p.display === 'granted'
    } catch { return false }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'default' && !webAsked) {
        webAsked = true
        await Notification.requestPermission()
      }
      return Notification.permission === 'granted'
    } catch { return false }
  }
  return false
}

// "HH:MM" -> bugünkü Date
const todayAt = (hhmm) => {
  const [h, m] = String(hhmm || '').split(':').map(Number)
  if (Number.isNaN(h)) return null
  const d = new Date()
  d.setHours(h, m || 0, 0, 0)
  return d
}

// Terapiste randevu atandığında bildirim + (varsa) 15 dk önce hatırlatma
export async function notifyAssignment({ therapist, service, time, guest, reminder = true }) {
  if (!therapist) return
  const title = `Yeni randevu — ${therapist}`
  const body = `${service} · ${time}${guest ? ' · ' + guest : ''}`
  const ok = await ensurePermission()
  if (!ok) return

  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const notifications = [
        { id: Math.floor(Math.random() * 1e6), title, body, schedule: { at: new Date(Date.now() + 400) } },
      ]
      if (reminder) {
        const start = todayAt(time)
        if (start) {
          const at = new Date(start.getTime() - 15 * 60 * 1000)
          if (at.getTime() > Date.now() + 60 * 1000) {
            notifications.push({
              id: Math.floor(Math.random() * 1e6),
              title: `Hatırlatma — ${therapist}`,
              body: `${time} ${service}${guest ? ' · ' + guest : ''} (15 dk sonra)`,
              schedule: { at },
            })
          }
        }
      }
      await LocalNotifications.schedule({ notifications })
    } catch { /* no-op */ }
  } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body, icon: 'icon-192.png' }) } catch { /* no-op */ }
  }
}
