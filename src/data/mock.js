// =============================================================================
// OscarSpa — Mock veri katmanı (ilk MVP; ileride REST/GraphQL API'ye taşınacak)
// Veri modeli: User, Guest, Service, Therapist, Room, Appointment, Sale,
//             Package, InventoryItem, Commission
// =============================================================================

export const HOTEL = '' // işletme adı Ayarlar'dan girilir
export const USD_TRY = 34.0 // prim USD tutarlarını ekranlarda referans için

// ---- Roller & yetkiler (Sayfa 04) --------------------------------------------
export const ROLES = [
  { id: 'owner',      name: 'Owner / Genel Müdür', icon: 'shield',    desc: 'Tüm raporlar, finans, yetkiler, entegrasyonlar' },
  { id: 'manager',    name: 'Spa Manager',         icon: 'settings',  desc: 'Takvim, spa floor, mesai, paket, stok, rapor' },
  { id: 'reception',  name: 'Resepsiyon',          icon: 'calendar',  desc: 'Randevu, misafir arama, ödeme, odaya yazdırma' },
  { id: 'therapist',  name: 'Terapist',            icon: 'therapist', desc: 'Kendi programı, işlem tamamlama, not' },
  { id: 'accounting', name: 'Muhasebe',            icon: 'finance',   desc: 'Kasa, komisyon, gelir/gider, fatura' },
]

// Kullanıcı hesapları (şimdilik demo — ileride gerçek backend + şifreleme)
// therapistId dolu ise kullanıcı sadece o terapistin randevularını görür.
export const ACCOUNTS = [
  { username: 'cigdem', password: 'cigdem123', role: 'owner',     name: 'Çiğdem', therapistId: null },
  { username: 'dita',   password: 'dita123',   role: 'therapist', name: 'Dita',   therapistId: 't1' },
  { username: 'sitti',  password: 'sitti123',  role: 'therapist', name: 'Sitti',  therapistId: 't2' },
]

// Rol bazlı menü erişimi
export const ROLE_ACCESS = {
  owner:      '*',
  manager:    ['dashboard','appointments','guests','therapists','services','packages','sales','finance','reports','settings'],
  reception:  ['dashboard','appointments','guests','services','packages','sales'],
  therapist:  ['dashboard','appointments','mycommissions'], // takvim/kendi programı + kendi primleri
  accounting: ['dashboard','sales','finance','reports'],
}

// ---- Terapistler (Sayfa 08) --------------------------------------------------
export const therapists = [
  { id: 't1', name: 'Dita',  initials: 'D', color: '#d6336c', active: true, skills: ['Masaj','Kese köpük','Paket'], shift: '10:00 - 19:00', rating: 0, todayCount: 0, monthCommissionUsd: 0, load: 0 },
  { id: 't2', name: 'Sitti', initials: 'S', color: '#3b5bdb', active: true, skills: ['Masaj','Kese köpük','Paket'], shift: '11:00 - 20:00', rating: 0, todayCount: 0, monthCommissionUsd: 0, load: 0 },
]

// ---- Prim kuralları (Sayfa 08) — varsayılan USD bazlı ------------------------
export const COMMISSION_RULES = [
  { id: 'massage', label: 'Sadece Masaj', usd: 1.0 },
  { id: 'scrub',   label: 'Kese Köpük',   usd: 0.5 },
  { id: 'package', label: 'Paket Satışı', usd: 1.5 },
]
export const commissionFor = (type) =>
  (COMMISSION_RULES.find((r) => r.id === type)?.usd) ?? 1.0

// ---- Hizmetler — Oscar Seaside Spa & Wellness Menü (gerçek fiyat listesi) -----
// commissionType: massage | scrub | package | none (ücretsiz hamam)
// hasPackage: true olan masajlar iki türde satılabilir:
//   • Sadece Masaj (50 dk)            -> price     , prim: massage
//   • Paket (50 dk masaj + 30 dk kese & köpük · sauna, hamam, maske & içecek dahil)
//                                     -> pkgPrice  , prim: package
export const PACKAGE_DURATION = 80
export const PACKAGE_INFO = '50 dk masaj + 30 dk kese & köpük · sauna, hamam, maske & içecek dahil'
export const SOLO_INFO = '50 dakika masaj'

export const services = [
  { id: 'm_klasik',  name: 'Klasik Masaj',      cat: 'Masaj', duration: 50, price: 1800, pkgPrice: 2200, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_bali',    name: 'Balı Masajı',       cat: 'Masaj', duration: 50, price: 2000, pkgPrice: 2400, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_shiatsu', name: 'Shiatsu Masajı',    cat: 'Masaj', duration: 50, price: 2000, pkgPrice: 2400, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_lomi',    name: 'Lomi Lomi Masajı',  cat: 'Masaj', duration: 50, price: 2200, pkgPrice: 2600, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_medikal', name: 'Medikal Masaj',     cat: 'Masaj', duration: 50, price: 2200, pkgPrice: 2600, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_aroma',   name: 'Aromaterapi Masaj', cat: 'Masaj', duration: 50, price: 2200, pkgPrice: 2600, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'drop' },
  { id: 'm_mix',     name: 'Mix Masaj',         cat: 'Masaj', duration: 50, price: 2400, pkgPrice: 2800, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_derin',   name: 'Derin Doku Masajı', cat: 'Masaj', duration: 50, price: 2400, pkgPrice: 2800, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_sicak',   name: 'Sıcak Taş Masajı',  cat: 'Masaj', duration: 50, price: 2600, pkgPrice: 3000, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_sporcu',  name: 'Sporcu Masajı',     cat: 'Masaj', duration: 50, price: 2600, pkgPrice: 3000, hasPackage: true, roomTypes: ['room','vip'], commissionType: 'massage', icon: 'therapist' },
  { id: 'm_sultan',  name: 'Sultan Masajı',     cat: 'Masaj', duration: 50, price: 4000, pkgPrice: 4400, hasPackage: true, roomTypes: ['vip','room'], commissionType: 'massage', icon: 'star', tag: '4 Hand' },
  { id: 'h_kese',    name: 'Kese & Köpük Hamam', cat: 'Hamam', duration: 30, price: 800, roomTypes: ['hammam'], commissionType: 'scrub', icon: 'drop' },
  { id: 'h_free',    name: 'Ücretsiz Hamam Kullanımı', cat: 'Hamam', duration: 60, price: 0, roomTypes: ['hammam'], commissionType: 'none', free: true, icon: 'drop' },
]

// Randevu açarken "müşteri gelince karar verecek" seçeneği (girişte belirlenir)
export const UNDECIDED_SERVICE = {
  id: 'undecided', name: 'Girişte Belirlenecek', cat: 'Karar', duration: 60, price: 0,
  roomTypes: ['room', 'vip', 'hammam', 'cabin'], commissionType: 'none', undecided: true, icon: 'clock',
}

// ---- Odalar / kabin / hamam (Sayfa 06) ---------------------------------------
// status: free | busy | soon | clean | maint
export const rooms = [
  { id: 'r1', name: 'Room 1',   type: 'room',   capacity: 1, status: 'free', note: 'Müsait', sub: 'Hazır', time: 'Müsait' },
  { id: 'r2', name: 'Room 2',   type: 'room',   capacity: 1, status: 'free', note: 'Müsait', sub: 'Hazır', time: 'Müsait' },
  { id: 'r3', name: 'Room 3',   type: 'room',   capacity: 2, status: 'free', note: 'Müsait', sub: 'Hazır', time: 'Müsait' },
  { id: 'h1', name: 'Hammam',   type: 'hammam', capacity: 4, status: 'free', note: 'Müsait', sub: 'Hazır', time: 'Müsait' },
  { id: 'c1', name: 'Kabin 1',  type: 'cabin',  capacity: 1, status: 'free', note: 'Müsait', sub: 'Hazır', time: 'Müsait' },
  { id: 'v1', name: 'VIP Room', type: 'vip',    capacity: 2, status: 'free', note: 'Müsait', sub: 'Hazır', time: 'Müsait' },
]

export const STATUS_META = {
  free:  { label: 'Müsait',     cls: 'free' },
  busy:  { label: 'Dolu',       cls: 'busy' },
  soon:  { label: 'Yaklaşıyor', cls: 'soon' },
  clean: { label: 'Temizlik',   cls: 'clean' },
  maint: { label: 'Bakım',      cls: 'maint' },
}
export const ROOM_TYPE_LABEL = { room: 'Oda', hammam: 'Hamam', cabin: 'Kabin', vip: 'VIP' }

// ---- Misafirler (Sayfa 07) ---------------------------------------------------
export const guests = []

// ---- Bugünkü randevular (Sayfa 01/05) ----------------------------------------
// status: booked | inservice | done ; freeHammam ise terapist yok, prim yok
// variant: 'solo' (Sadece Masaj) | 'package' (Paket) — masajlarda geçerli
// commissionType randevuda saklanır: prim ödeme anında buna göre yazılır
export const appointments = []

// ---- Paketler (Sayfa 14) -----------------------------------------------------
export const packages = []

// ---- Stok (Sayfa 11) ---------------------------------------------------------
export const inventory = []

// ---- Finans & KPI (Sayfa 01 / 11) --------------------------------------------
export const KPIS = {
  revenue: { label: 'Günlük Ciro', value: '₺0', delta: null },
  occupancy: { label: 'Doluluk', value: '%0', delta: null },
  appts: { label: 'Bugünkü Randevu', value: '0', delta: null },
  guests: { label: 'Misafir Sayısı', value: '0', delta: null },
  basket: { label: 'Ortalama Sepet', value: '₺0', delta: null },
}
export const FINANCE = { income: 0, expense: 0, commission: 0, net: 0 }

// ---- Adisyon örneği (Sayfa 09) -----------------------------------------------
export const sampleTicket = {
  no: 'SP-1024', guest: 'Ahmet Yılmaz', roomNo: '216',
  lines: [
    { service: 'Sadece Masaj', therapist: 'Sitti', amount: 2500, commissionType: 'massage' },
    { service: 'Kese Köpük',   therapist: 'Sitti', amount: 1200, commissionType: 'scrub' },
    { service: 'Paket Satışı', therapist: 'Dita',  amount: 6000, commissionType: 'package' },
  ],
}

// ---- AI önerileri (Sayfa 13) -------------------------------------------------
export const aiSuggestions = []

// ---- Zaman aralıkları (takvim) -----------------------------------------------
export const HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

// ---- Yardımcılar -------------------------------------------------------------
export const fmtTRY = (n) =>
  '₺' + Number(n).toLocaleString('tr-TR', { maximumFractionDigits: 0 })
export const fmtUSD = (n) => '$' + Number(n).toFixed(2)
