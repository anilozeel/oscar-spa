// Spa peşin satışı -> Oscar Spa folyosu (restoranın Elektra motoru, /menu/api.php).
// Aynı alan adı (oscarseasidehotel.com) olduğundan same-origin çağrı; token sunucuda kalır.
// Sadece Nakit / Kredi Kartı / Havale Elektra'ya gider. Paketten/Odaya Yaz atlanır.

const PM_LABEL = { cash: 'Nakit', card: 'Kredi Kartı', transfer: 'Havale' }

export async function postSpaElektra({ amount, service, pm, guest }) {
  const label = PM_LABEL[pm]
  if (!label || !(Number(amount) > 0)) return { ok: false, skipped: true }
  try {
    const r = await fetch('/menu/api.php?fn=spasanal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), service: service || 'Spa', pm: label, guest: guest || '' }),
    })
    return await r.json().catch(() => ({ ok: false, error: 'bad_response' }))
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function spaElektraDiscover() {
  try {
    const r = await fetch('/menu/api.php?fn=spadiscover')
    return await r.json().catch(() => ({ ok: false, error: 'bad_response' }))
  } catch {
    return { ok: false, error: 'network' }
  }
}
