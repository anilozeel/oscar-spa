// ---------------------------------------------------------------------------
// Ay bazlı dönem yardımcıları — primler/raporlar aylık filtrelensin diye
// ---------------------------------------------------------------------------

const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

// "YYYY-MM" anahtarı. d verilmezse içinde bulunulan ay.
// d bir "YYYY-MM-DD" string'i veya Date olabilir.
export function monthKeyOf(d) {
  if (!d) {
    const x = new Date()
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`
  }
  const s = String(d)
  if (/^\d{4}-\d{2}/.test(s)) return s.slice(0, 7)
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return ''
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`
}

// "2026-11" -> "Kasım 2026"
export function monthLabel(key) {
  const [y, m] = String(key || '').split('-')
  const i = Number(m) - 1
  if (!y || i < 0 || i > 11) return key || '—'
  return `${TR_MONTHS[i]} ${y}`
}

// Kayıtlardaki (date alanlı) ayların listesi — en yeni önce.
// İçinde bulunulan ay her zaman listede olur (boş ay da seçilebilsin).
export function listMonths(records, dateField = 'date') {
  const set = new Set()
  for (const r of (records || [])) {
    const k = monthKeyOf(r && r[dateField])
    if (k) set.add(k)
  }
  set.add(monthKeyOf())
  return [...set].sort().reverse()
}
