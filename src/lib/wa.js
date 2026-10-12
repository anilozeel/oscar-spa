// WhatsApp bildirimleri — Twilio proxy (wa.php) uzerinden.
// Besteffort: hata olursa sessizce gecer, uygulamayi bloklamaz.
// Auth Token sunucuda (wa.config.json) tutulur; tarayiciya gitmez.

const WA_ENDPOINT = '/spa/wa.php'

// WhatsApp bildirimi açık/kapalı. Numara/hat hazır olunca true yapılır —
// randevu sonrası "WhatsApp Gönder" adımı ve butonları o zaman görünür.
export const WA_ENABLED = false

// --- wa.me (tek dokunuşla gönderim — kendi normal WhatsApp hattınızla) --------
// Numarayı E.164'e çevir (Türkiye varsayılan): 05xx / 5xx / +90xx / 90xx kabul.
export function toE164(raw) {
  const d = String(raw || '').replace(/\D+/g, '')
  if (!d) return ''
  if (d.startsWith('90')) return d
  if (d.startsWith('0')) return '90' + d.slice(1)
  if (d.length === 10) return '90' + d
  return d
}
// Mesajı hazır şekilde WhatsApp'ta açar (personel "Gönder"e basar). Twilio GEREKMEZ.
export function waLink(phone, body) {
  const n = toE164(phone)
  if (!n) return ''
  return `https://wa.me/${n}?text=${encodeURIComponent(body || '')}`
}
export function openWa(phone, body) {
  const url = waLink(phone, body)
  if (!url) return false
  try { window.open(url, '_blank', 'noopener') } catch { location.href = url }
  return true
}

export async function sendWhatsApp(to, body) {
  if (!to || !body) return { ok: false, error: 'missing' }
  try {
    const r = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, body }),
    })
    return await r.json().catch(() => ({ ok: false, error: 'bad_response' }))
  } catch {
    return { ok: false, error: 'network' }
  }
}

// Mesaj sablonlari
export const waMsg = {
  // Terapiste: yeni randevu atandi bildirimi
  therapistNew: (a, dateLabel) =>
    `🗓️ *Yeni Randevu — Oscar Spa*\n` +
    `Sayın ${a.therapist || 'terapist'}, size yeni bir randevu atanmıştır:\n` +
    `📅 ${dateLabel || ''} · ⏰ ${a.time}–${a.end}\n` +
    `💆 ${a.service}\n` +
    `👤 Misafir: ${a.guest || '—'}${a.phone ? ' · ' + a.phone : ''}`,
  // Musteriye: randevu olusturuldu bilgisi
  guestNew: (a, dateLabel) =>
    `Sayın ${a.guest},\n` +
    `${dateLabel} ${a.time} için *${a.service}* randevunuz oluşturulmuştur.\n` +
    `Sizi aramızda görmekten mutluluk duyacağız. 🌿\n` +
    `Oscar Seaside Hotel & Spa`,
}
