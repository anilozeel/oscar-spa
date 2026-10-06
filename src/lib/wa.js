// WhatsApp bildirimleri — Twilio proxy (wa.php) uzerinden.
// Besteffort: hata olursa sessizce gecer, uygulamayi bloklamaz.
// Auth Token sunucuda (wa.config.json) tutulur; tarayiciya gitmez.

const WA_ENDPOINT = '/spa/wa.php'

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
  therapistNew: (a) =>
    `🗓️ Yeni randevu\n${a.time}–${a.end} · ${a.service}\nMisafir: ${a.guest}${a.phone ? ' (' + a.phone + ')' : ''}`,
  guestNew: (a, dateLabel) =>
    `Merhaba ${a.guest}, Oscar Spa randevunuz oluşturuldu:\n📅 ${dateLabel} · ⏰ ${a.time}\n💆 ${a.service}\nGörüşmek üzere! 🌿`,
}
