import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import * as mock from '../data/mock.js'
import { notifyAssignment } from '../lib/notify.js'
import { FIREBASE_ENABLED, db, auth } from '../lib/firebase.js'
import { AUTH_EMAIL_SUFFIX } from '../lib/firebaseConfig.js'
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const overlap = (aS, aE, bS, bE) => toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE)
const uid = () => 'x' + Math.random().toString(36).slice(2, 8)
// Firestore undefined kabul etmez — undefined alanları at
const clean = (o) => { const r = {}; for (const k in o) if (o[k] !== undefined) r[k] = o[k]; return r }

// --- Firestore yardımcıları (yalnızca Firebase aktifken) --------------------
const fsSet = (coll, id, data) => setDoc(doc(db, coll, id), clean(data))
const fsUpdate = (coll, id, patch) => updateDoc(doc(db, coll, id), clean(patch))
const fsDelete = (coll, id) => deleteDoc(doc(db, coll, id))

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem('oscarspa.user') || 'null') } catch { return null }
}
const persistUser = (u) => { try { localStorage.setItem('oscarspa.user', JSON.stringify(u)) } catch { /* no-op */ } }

const buildUser = (acc) => {
  const role = mock.ROLES.find((r) => r.id === acc.role) || mock.ROLES[0]
  const initials = acc.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return { name: acc.name, username: acc.username, role: acc.role, roleName: role.name, initials, therapistId: acc.therapistId || null }
}
const findAcc = (uname) =>
  mock.ACCOUNTS.find((a) => a.username.toLowerCase() === String(uname || '').trim().toLowerCase())

export function StoreProvider({ children }) {
  const [user, setUser] = useState(loadUser)      // oturum kalıcı
  const [authUid, setAuthUid] = useState(null)    // Firebase Auth hazır olunca dolar
  // Firebase modda veriler snapshot ile dolar; yerel modda mock ilk değerdir
  const [appointments, setAppointments] = useState(FIREBASE_ENABLED ? [] : mock.appointments)
  const [services, setServices] = useState(mock.services)  // menü (fiyat listesi) kod tabanlı
  const [packages, setPackages] = useState(FIREBASE_ENABLED ? [] : mock.packages)
  const [guests, setGuests] = useState(FIREBASE_ENABLED ? [] : mock.guests)
  const [sales, setSales] = useState([])            // kapatılan adisyonlar (arşiv)
  const [commissions, setCommissions] = useState([]) // ödeme anında yazılan primler
  const [toasts, setToasts] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toast = useCallback((msg, kind = 'ok') => {
    const id = uid()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  // --- Auth (kullanıcı adı + şifre; Firebase Auth veya yerel) ---------------
  const login = useCallback(async (username, password) => {
    const acc = findAcc(username)
    if (FIREBASE_ENABLED) {
      if (!acc) return false // yalnızca tanımlı personel girebilir
      try {
        await signInWithEmailAndPassword(auth, acc.username.toLowerCase() + AUTH_EMAIL_SUFFIX, password)
        const u = buildUser(acc); setUser(u); persistUser(u) // anında; onAuthStateChanged de teyit eder
        return true
      } catch { return false }
    }
    // yerel mod (demo şifreleri kod içinde)
    if (!acc || acc.password !== password) return false
    const u = buildUser(acc); setUser(u); persistUser(u)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try { localStorage.removeItem('oscarspa.user') } catch { /* no-op */ }
    if (FIREBASE_ENABLED) signOut(auth).catch(() => {})
  }, [])

  // Firebase oturumunu geri yükle / dinle
  useEffect(() => {
    if (!FIREBASE_ENABLED) return
    const unsub = onAuthStateChanged(auth, (fb) => {
      if (fb && fb.email) {
        setAuthUid(fb.uid)
        const acc = findAcc(fb.email.split('@')[0])
        if (acc) { const u = buildUser(acc); setUser(u); persistUser(u) }
      } else {
        setAuthUid(null); setUser(null)
        try { localStorage.removeItem('oscarspa.user') } catch { /* no-op */ }
      }
    })
    return unsub
  }, [])

  // Firestore canlı dinleyiciler (giriş yapıldıktan sonra)
  useEffect(() => {
    if (!FIREBASE_ENABLED || !authUid) return
    const byTime = (a, b) => String(a.time || '').localeCompare(String(b.time || ''))
    const byNewest = (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    const sub = (coll, setter, sortFn) => onSnapshot(
      collection(db, coll),
      (snap) => {
        let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (sortFn) rows = rows.sort(sortFn)
        setter(rows)
      },
      (err) => { console.warn('[OscarSpa] veri dinleme hatası:', coll, err?.code || err) },
    )
    const unsubs = [
      sub('appointments', setAppointments, byTime),
      sub('guests', setGuests, byNewest),
      sub('packages', setPackages, byNewest),
      sub('sales', setSales, byNewest),
      sub('commissions', setCommissions, byNewest),
    ]
    return () => unsubs.forEach((u) => u())
  }, [authUid])

  const canAccess = useCallback((key) => {
    if (!user) return false
    const a = mock.ROLE_ACCESS[user.role]
    return a === '*' || a.includes(key)
  }, [user])

  // --- Çakışma kontrolü: aynı terapist aynı saatte olamaz -------------------
  const findConflict = useCallback((draft, ignoreId = null) => {
    if (!draft.therapistId) return null
    for (const a of appointments) {
      if (a.id === ignoreId || a.status === 'done' || a.hidden) continue
      if (!overlap(draft.time, draft.end, a.time, a.end)) continue
      if (a.therapistId === draft.therapistId) return { type: 'therapist', name: a.therapist, with: a }
    }
    return null
  }, [appointments])

  // --- Misafir (CRM) yardımcıları ------------------------------------------
  const normPhone = (p) => String(p || '').replace(/\D/g, '')
  const findOrCreateGuest = useCallback(({ name, phone }) => {
    const nm = String(name || '').trim()
    if (!nm) return null
    const ph = normPhone(phone)
    const existing = guests.find((g) => (ph && normPhone(g.phone) === ph) || g.name.toLowerCase() === nm.toLowerCase())
    if (existing) return existing
    const g = {
      id: 'g_' + uid(), name: nm, phone: String(phone || '').trim(),
      initials: nm.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      vip: false, notes: '', prefs: [], createdAt: Date.now(),
    }
    if (FIREBASE_ENABLED) fsSet('guests', g.id, g).catch(() => {})
    else setGuests((l) => [g, ...l])
    return g
  }, [guests])

  const addGuest = useCallback((data) => {
    const nm = String(data.name || '').trim()
    if (!nm) return null
    const g = {
      id: 'g_' + uid(), name: nm, phone: String(data.phone || '').trim(),
      initials: nm.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      vip: !!data.vip, notes: data.notes || '', prefs: data.prefs || [], createdAt: Date.now(),
    }
    if (FIREBASE_ENABLED) fsSet('guests', g.id, g).then(() => toast('Misafir kaydedildi: ' + nm)).catch(() => toast('Kayıt yapılamadı', 'warn'))
    else { setGuests((l) => [g, ...l]); toast('Misafir kaydedildi: ' + nm) }
    return g
  }, [toast])

  const addAppointment = useCallback((draft) => {
    const conflict = findConflict(draft)
    if (conflict) {
      toast(`${conflict.name} bu saatte dolu — çakışma engellendi`, 'warn')
      return false
    }
    const g = draft.guest ? findOrCreateGuest({ name: draft.guest, phone: draft.phone }) : null
    const appt = { ...draft, id: uid(), guestId: draft.guestId || g?.id || null, hidden: false, createdAt: Date.now() }
    if (FIREBASE_ENABLED) fsSet('appointments', appt.id, appt).catch(() => toast('Randevu kaydedilemedi', 'warn'))
    else setAppointments((list) => [...list, appt])
    toast('Randevu oluşturuldu')
    if (draft.therapistId && !draft.freeHammam) {
      notifyAssignment({ therapist: draft.therapist, service: draft.service, time: draft.time, guest: draft.guest })
    }
    return true
  }, [findConflict, toast, findOrCreateGuest])

  const cancelAppointment = useCallback((id) => {
    if (FIREBASE_ENABLED) fsDelete('appointments', id).catch(() => {})
    else setAppointments((l) => l.filter((a) => a.id !== id))
    toast('Randevu iptal edildi')
  }, [toast])

  // --- Randevu güncelleme (düzenleme + sürükle-bırak) -----------------------
  const updateAppointment = useCallback((id, patch, opts = {}) => {
    const cur = appointments.find((a) => a.id === id)
    if (!cur) return false
    const draft = { ...cur, ...patch }
    const conflict = findConflict({ time: draft.time, end: draft.end, therapistId: draft.therapistId }, id)
    if (conflict) {
      toast(`${conflict.name} bu saatte dolu — çakışma engellendi`, 'warn')
      return false
    }
    let finalPatch = patch
    if (patch.guest) {
      const g = findOrCreateGuest({ name: patch.guest, phone: patch.phone ?? cur.phone })
      if (g) finalPatch = { ...patch, guestId: patch.guestId || g.id }
    }
    if (FIREBASE_ENABLED) fsUpdate('appointments', id, finalPatch).catch(() => toast('Güncellenemedi', 'warn'))
    else setAppointments((l) => l.map((a) => (a.id === id ? { ...a, ...finalPatch } : a)))
    if (!opts.silent) toast('Randevu güncellendi')
    if (patch.therapistId && patch.therapistId !== cur.therapistId) {
      notifyAssignment({ therapist: draft.therapist, service: draft.service, time: draft.time, guest: draft.guest })
    }
    return true
  }, [appointments, findConflict, toast, findOrCreateGuest])

  // --- Paket yardımcıları ---------------------------------------------------
  const activePackageFor = useCallback(
    (guestId) => packages.find((p) => p.guestId === guestId && p.used < p.total),
    [packages]
  )
  const usePackageSession = useCallback((pkgId) => {
    const p = packages.find((x) => x.id === pkgId)
    if (!p) return
    const used = Math.min(p.total, p.used + 1)
    if (FIREBASE_ENABLED) fsUpdate('packages', pkgId, { used }).catch(() => {})
    else setPackages((l) => l.map((x) => (x.id === pkgId ? { ...x, used } : x)))
  }, [packages])

  // --- Adisyon kapatma: prim ödeme anındaki terapiste yazılır ---------------
  const closeTicket = useCallback((appt, { therapistId, payType, hideAfter, override, packageId, roomNo }) => {
    const service = mock.services.find((s) => s.id === appt.serviceId)
    const effType = override?.commissionType ?? appt.commissionType ?? service?.commissionType
    const isFree = appt.freeHammam || effType === 'none'
    const fromPackage = payType === 'package'
    const amount = fromPackage ? 0 : (override?.price ?? appt.price)
    const serviceName = (override?.serviceName ?? appt.service) + (fromPackage ? ' (Paketten)' : '')
    const therapist = mock.therapists.find((t) => t.id === therapistId)
    const commissionUsd = isFree ? 0 : mock.commissionFor(effType)

    const sale = {
      id: uid(), no: 'SP-' + Math.floor(1000 + Math.random() * 9000),
      apptId: appt.id, guest: appt.guest, roomNo: roomNo || '',
      service: serviceName, amount,
      therapist: isFree ? '—' : (therapist?.name || appt.therapist || '—'),
      therapistId: isFree ? null : therapistId,
      payType, commissionUsd, date: 'Bugün', archived: true, createdAt: Date.now(),
    }
    const commission = (!isFree && commissionUsd > 0)
      ? { id: uid(), saleId: sale.id, therapistId, therapist: therapist?.name || '', type: effType, usd: commissionUsd, paid: false, date: 'Bugün', createdAt: Date.now() }
      : null
    const apptPatch = {
      status: 'done', pay: payType, service: serviceName, price: amount,
      therapistId: isFree ? null : therapistId, therapist: isFree ? null : (therapist?.name || appt.therapist || null),
      ...(hideAfter ? { hidden: true } : {}),
    }

    if (FIREBASE_ENABLED) {
      fsSet('sales', sale.id, sale).catch(() => toast('Adisyon kaydedilemedi', 'warn'))
      if (commission) fsSet('commissions', commission.id, commission).catch(() => {})
      fsUpdate('appointments', appt.id, apptPatch).catch(() => {})
    } else {
      setSales((s) => [sale, ...s])
      if (commission) setCommissions((c) => [commission, ...c])
      setAppointments((l) => l.map((a) => (a.id === appt.id ? { ...a, ...apptPatch } : a)))
    }
    if (fromPackage && packageId) usePackageSession(packageId)

    toast(isFree
      ? 'Ücretsiz işlem tamamlandı — prim yazılmadı'
      : fromPackage
        ? `Paketten 1 seans düşüldü — prim ${therapist?.name}'e yazıldı (${mock.fmtUSD(commissionUsd)})`
        : `Ödeme alındı — prim ${therapist?.name}'e yazıldı (${mock.fmtUSD(commissionUsd)})`)
    return sale
  }, [toast, usePackageSession])

  // --- Hizmet & paket ekleme -----------------------------------------------
  const addService = useCallback((data) => {
    // Menü kod tabanlı; eklenen hizmet bu cihazda görünür (ileride paylaşımlı yapılabilir)
    setServices((l) => [...l, { ...data, id: 'svc_' + uid() }])
    toast(`Hizmet eklendi: ${data.name}`)
  }, [toast])

  const addPackage = useCallback((data) => {
    const pkg = { ...data, id: 'pkg_' + uid(), used: 0, createdAt: Date.now() }
    if (FIREBASE_ENABLED) fsSet('packages', pkg.id, pkg).then(() => toast(`Paket satıldı: ${data.name}`)).catch(() => toast('Paket kaydedilemedi', 'warn'))
    else { setPackages((l) => [pkg, ...l]); toast(`Paket satıldı: ${data.name}`) }
    return pkg
  }, [toast])

  const visibleAppointments = useMemo(
    () => appointments.filter((a) => !a.hidden),
    [appointments]
  )

  const value = {
    ...mock,
    FIREBASE_ENABLED,
    user, login, logout, canAccess,
    appointments, visibleAppointments, addAppointment, cancelAppointment, updateAppointment, findConflict, closeTicket,
    services, addService,
    packages, addPackage, activePackageFor,
    guests, addGuest,
    sales, commissions,
    toast, toasts,
    sidebarOpen, setSidebarOpen,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
