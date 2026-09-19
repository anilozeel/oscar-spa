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
  manager:    ['dashboard','appointments','floor','guests','therapists','services','packages','sales','inventory','finance','reports','settings'],
  reception:  ['dashboard','appointments','floor','guests','services','packages','sales'],
  therapist:  ['dashboard','appointments','floor'], // sadece takvim/kendi programı — para yok
  accounting: ['dashboard','sales','finance','reports','inventory'],
}

// ---- Terapistler (Sayfa 08) --------------------------------------------------
export const therapists = [
  { id: 't1', name: 'Dita',  initials: 'D', color: '#d6336c', active: true, skills: ['Masaj','Kese köpük','Paket','Aromatherapy'], shift: '10:00 - 19:00', rating: 4.9, todayCount: 5, monthCommissionUsd: 128.5, load: 52 },
  { id: 't2', name: 'Sitti', initials: 'S', color: '#3b5bdb', active: true, skills: ['Masaj','Kese köpük','Paket','Turkish Bath'], shift: '11:00 - 20:00', rating: 4.8, todayCount: 7, monthCommissionUsd: 173.0, load: 88 },
  { id: 't3', name: 'Selin', initials: 'SL', color: '#0ca678', active: true, skills: ['Masaj','Couple','Cilt bakımı'], shift: '09:00 - 17:00', rating: 4.7, todayCount: 3, monthCommissionUsd: 74.0, load: 46 },
  { id: 't4', name: 'Arda',  initials: 'A', color: '#7048e8', active: true, skills: ['Masaj','Couple','Deep Tissue'], shift: '12:00 - 21:00', rating: 4.6, todayCount: 2, monthCommissionUsd: 51.5, load: 38 },
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
  { id: 'r1', name: 'Room 1',   type: 'room',   capacity: 1, status: 'busy',  note: 'Deep Tissue', sub: 'Dita / Oda 216', time: '14:00 - 15:00' },
  { id: 'r2', name: 'Room 2',   type: 'room',   capacity: 1, status: 'free',  note: 'Son temizlik tamam', sub: 'Hazır', time: 'Müsait' },
  { id: 'r3', name: 'Room 3',   type: 'room',   capacity: 2, status: 'busy',  note: 'Couple Massage', sub: 'Selin & Arda', time: '15:00 - 16:30' },
  { id: 'r4', name: 'Room 4',   type: 'room',   capacity: 1, status: 'maint', note: '17:00’ye kadar kapalı', sub: 'Teknik ekip', time: 'Bakım' },
  { id: 'h1', name: 'Hammam',   type: 'hammam', capacity: 4, status: 'soon',  note: 'Turkish Bath', sub: 'Sitti', time: '14:30 - 15:30' },
  { id: 'c1', name: 'Kabin 1',  type: 'cabin',  capacity: 1, status: 'free',  note: 'Cilt bakımı', sub: 'Hazır', time: 'Müsait' },
  { id: 'c2', name: 'Kabin 2',  type: 'cabin',  capacity: 1, status: 'clean', note: 'Temizlik', sub: 'Personel atanmış', time: '15 dk kaldı' },
  { id: 'v1', name: 'VIP Room', type: 'vip',    capacity: 2, status: 'soon',  note: 'Aromatherapy', sub: 'Dita', time: '18:00 - 19:30' },
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
export const guests = [
  {
    id: 'g1', name: 'Anıl Özel', initials: 'AÖ', vip: true, phone: '+90 532 000 00 00',
    roomNo: '216', lastVisit: '19.09.2026', totalVisits: 8, totalSpend: 19840,
    favTherapist: 'Dita', prefs: ['Deep Tissue', 'Medium', 'Akşam saatleri'],
    notes: 'Masaj basıncı hassas bölge; terapist tercihi Dita.',
  },
  { id: 'g2', name: 'John Smith', initials: 'JS', vip: false, phone: '+44 7700 900123', roomNo: '214', lastVisit: '18.09.2026', totalVisits: 3, totalSpend: 5400, favTherapist: 'Sitti', prefs: ['Hamam', 'Sabah'], notes: 'Ücretsiz hamam paketi dahil (oda tipi).' },
  { id: 'g3', name: 'Ahmet Yılmaz', initials: 'AY', vip: true, phone: '+90 555 111 22 33', roomNo: '216', lastVisit: '19.09.2026', totalVisits: 12, totalSpend: 31200, favTherapist: 'Sitti', prefs: ['Kese Köpük', 'Paket'], notes: 'Aylık paket üyesi.' },
  { id: 'g4', name: 'Elena Petrova', initials: 'EP', vip: false, phone: '+7 900 000 0000', roomNo: '331', lastVisit: '15.09.2026', totalVisits: 2, totalSpend: 4200, favTherapist: 'Selin', prefs: ['Cilt Bakımı'], notes: 'Cilt hassasiyeti — patch test yapıldı.' },
  { id: 'g5', name: 'Mehmet Demir', initials: 'MD', vip: false, phone: '+90 542 987 65 43', roomNo: '108', lastVisit: '12.09.2026', totalVisits: 5, totalSpend: 9600, favTherapist: 'Arda', prefs: ['Deep Tissue', 'Couple'], notes: '' },
  { id: 'g6', name: 'Sofia Rossi', initials: 'SR', vip: true, phone: '+39 320 000 0000', roomNo: '402', lastVisit: '10.09.2026', totalVisits: 9, totalSpend: 22800, favTherapist: 'Dita', prefs: ['Aromatherapy', 'VIP Room'], notes: 'VIP oda tercih ediyor.' },
]

// ---- Bugünkü randevular (Sayfa 01/05) ----------------------------------------
// status: booked | inservice | done ; freeHammam ise terapist yok, prim yok
// variant: 'solo' (Sadece Masaj) | 'package' (Paket) — masajlarda geçerli
// commissionType randevuda saklanır: prim ödeme anında buna göre yazılır
export const appointments = [
  { id: 'a1', time: '10:00', end: '10:50', serviceId: 'm_klasik',  service: 'Klasik Masaj',      variant: 'solo',    commissionType: 'massage', therapistId: 't1', therapist: 'Dita',  roomId: 'r1', room: 'Room 1',  guestId: 'g1', guest: 'Anıl Özel',     price: 1800, status: 'done',      pay: 'card' },
  { id: 'a2', time: '11:30', end: '12:20', serviceId: 'm_bali',    service: 'Balı Masajı',       variant: 'solo',    commissionType: 'massage', therapistId: 't3', therapist: 'Selin', roomId: 'r2', room: 'Room 2',  guestId: 'g4', guest: 'Elena Petrova', price: 2000, status: 'inservice', pay: null },
  { id: 'a3', time: '13:00', end: '14:20', serviceId: 'm_medikal', service: 'Medikal Masaj',     variant: 'package', commissionType: 'package', therapistId: 't3', therapist: 'Selin', roomId: 'r2', room: 'Room 2',  guestId: 'g4', guest: 'Elena Petrova', price: 2600, status: 'booked',    pay: null },
  { id: 'a4', time: '14:00', end: '14:50', serviceId: 'm_derin',   service: 'Derin Doku Masajı', variant: 'solo',    commissionType: 'massage', therapistId: 't1', therapist: 'Dita',  roomId: 'r1', room: 'Room 1',  guestId: 'g1', guest: 'Anıl Özel',     price: 2400, status: 'inservice', pay: null },
  { id: 'a5', time: '14:30', end: '15:00', serviceId: 'h_kese',    service: 'Kese & Köpük Hamam', variant: null,     commissionType: 'scrub',   therapistId: 't2', therapist: 'Sitti', roomId: 'h1', room: 'Hammam',  guestId: 'g3', guest: 'Ahmet Yılmaz',  price: 800,  status: 'booked',    pay: null },
  { id: 'a6', time: '15:00', end: '16:00', serviceId: 'h_free',    service: 'Ücretsiz Hamam Kullanımı', variant: null, commissionType: 'none', therapistId: null, therapist: null, roomId: 'h1', room: 'Hammam', guestId: 'g2', guest: 'John Smith', price: 0, status: 'booked', pay: null, freeHammam: true },
  { id: 'a7', time: '15:00', end: '16:20', serviceId: 'm_sultan',  service: 'Sultan Masajı',     variant: 'package', commissionType: 'package', therapistId: 't4', therapist: 'Arda',  roomId: 'v1', room: 'VIP Room', guestId: 'g5', guest: 'Mehmet Demir',  price: 4400, status: 'booked',    pay: null },
  { id: 'a8', time: '16:00', end: '16:50', serviceId: 'm_aroma',   service: 'Aromaterapi Masaj', variant: 'solo',    commissionType: 'massage', therapistId: 't1', therapist: 'Dita',  roomId: 'v1', room: 'VIP Room', guestId: 'g6', guest: 'Sofia Rossi',   price: 2200, status: 'booked',    pay: null },
  { id: 'a9', time: '17:00', end: '17:50', serviceId: 'undecided', service: 'Girişte Belirlenecek', variant: null,  commissionType: 'none',    therapistId: 't2', therapist: 'Sitti', roomId: 'r3', room: 'Room 3',  guestId: 'g5', guest: 'Mehmet Demir',  price: 0,    status: 'booked',    pay: null, undecided: true },
]

// ---- Paketler (Sayfa 14) -----------------------------------------------------
export const packages = [
  { id: 'p1', name: '10 Seans Masaj Paketi', guest: 'Ahmet Yılmaz', guestId: 'g3', total: 10, used: 6, price: 16000, expiry: '31.12.2026' },
  { id: 'p2', name: 'Aylık Hamam Üyeliği',   guest: 'Anıl Özel',    guestId: 'g1', total: 8,  used: 3, price: 7200,  expiry: '19.10.2026' },
  { id: 'p3', name: 'Cilt Bakım 5\'li',       guest: 'Sofia Rossi',  guestId: 'g6', total: 5,  used: 1, price: 9500,  expiry: '10.03.2027' },
  { id: 'p4', name: 'Wellness Premium',       guest: 'Mehmet Demir', guestId: 'g5', total: 12, used: 11, price: 21000, expiry: '01.11.2026' },
]

// ---- Stok (Sayfa 11) ---------------------------------------------------------
export const inventory = [
  { id: 'i1', name: 'Masaj Yağı 100 ml', qty: 12, min: 15, unit: 'adet', cost: 180, cat: 'Sarf' },
  { id: 'i2', name: 'Premium Havlu',      qty: 8,  min: 20, unit: 'adet', cost: 95,  cat: 'Tekstil' },
  { id: 'i3', name: 'Kese Eldiveni',      qty: 16, min: 25, unit: 'adet', cost: 40,  cat: 'Sarf' },
  { id: 'i4', name: 'Cilt Bakım Kremi',   qty: 5,  min: 10, unit: 'adet', cost: 320, cat: 'Ürün' },
  { id: 'i5', name: 'Aroma Yağı Seti',    qty: 22, min: 12, unit: 'set',  cost: 540, cat: 'Ürün' },
  { id: 'i6', name: 'Bornoz',             qty: 34, min: 20, unit: 'adet', cost: 260, cat: 'Tekstil' },
  { id: 'i7', name: 'Tek Kullanımlık Terlik', qty: 140, min: 60, unit: 'çift', cost: 12, cat: 'Sarf' },
]

// ---- Finans & KPI (Sayfa 01 / 11) --------------------------------------------
export const KPIS = {
  revenue: { label: 'Günlük Ciro', value: '₺84.250', delta: 12 },
  occupancy: { label: 'Doluluk', value: '%78', delta: 11 },
  appts: { label: 'Bugünkü Randevu', value: '34', delta: 6 },
  guests: { label: 'Misafir Sayısı', value: '18', delta: 13 },
  basket: { label: 'Ortalama Sepet', value: '₺2.478', delta: 8 },
}
export const FINANCE = { income: 284650, expense: 72410, commission: 38200, net: 174040 }

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
export const aiSuggestions = [
  { id: 'ai1', type: 'Doluluk', icon: 'clock', text: '17:00 - 20:00 arasında 3 boş terapist var. %15 Happy Hour kampanyası oluşturulsun mu?', cta: 'Kampanya oluştur' },
  { id: 'ai2', type: 'Fiyat', icon: 'finance', text: 'Cumartesi 15:00 - 19:00 doluluk %92. Bu saatlerde fiyat +%10 denenebilir.', cta: 'Fiyatı düzenle' },
  { id: 'ai3', type: 'Geri kazanım', icon: 'whatsapp', text: 'Son 90 günde gelip 30 gündür gelmeyen 164 misafir var. WhatsApp kampanyası öner.', cta: 'WhatsApp gönder' },
  { id: 'ai4', type: 'Stok', icon: 'stock', text: 'Masaj yağı tüketimi son 14 günde arttı. 5 gün içinde kritik seviyeye düşebilir.', cta: 'Sipariş oluştur' },
  { id: 'ai5', type: 'Personel', icon: 'therapist', text: 'Sitti doluluğu %88, Dita %52. Randevu dağılımı dengelenebilir.', cta: 'Dağılımı gör' },
]

// ---- Zaman aralıkları (takvim) -----------------------------------------------
export const HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

// ---- Yardımcılar -------------------------------------------------------------
export const fmtTRY = (n) =>
  '₺' + Number(n).toLocaleString('tr-TR', { maximumFractionDigits: 0 })
export const fmtUSD = (n) => '$' + Number(n).toFixed(2)
