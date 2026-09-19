import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import * as mock from '../data/mock.js'

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const overlap = (aS, aE, bS, bE) => toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE)
const uid = () => 'x' + Math.random().toString(36).slice(2, 8)

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem('oscarspa.user') || 'null') } catch { return null }
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(loadUser) // {name, role, roleName, initials} — oturum kalıcı
  const [appointments, setAppointments] = useState(mock.appointments)
  const [rooms, setRooms] = useState(mock.rooms)
  const [inventory, setInventory] = useState(mock.inventory)
  const [services, setServices] = useState(mock.services)
  const [packages, setPackages] = useState(mock.packages)
  const [sales, setSales] = useState([])            // kapatılan adisyonlar (arşiv)
  const [commissions, setCommissions] = useState([]) // ödeme anında yazılan primler
  const [hiddenAppts, setHiddenAppts] = useState([]) // takvimden gizlenen (arşivde kalır)
  const [toasts, setToasts] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toast = useCallback((msg, kind = 'ok') => {
    const id = uid()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  // --- Auth (kullanıcı adı + şifre) -----------------------------------------
  const login = useCallback((username, password) => {
    const acc = mock.ACCOUNTS.find(
      (a) => a.username.toLowerCase() === String(username || '').trim().toLowerCase() && a.password === password
    )
    if (!acc) return false
    const role = mock.ROLES.find((r) => r.id === acc.role) || mock.ROLES[0]
    const initials = acc.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    const u = { name: acc.name, username: acc.username, role: acc.role, roleName: role.name, initials, therapistId: acc.therapistId || null }
    setUser(u)
    try { localStorage.setItem('oscarspa.user', JSON.stringify(u)) } catch { /* no-op */ }
    return true
  }, [])
  const logout = useCallback(() => {
    setUser(null)
    try { localStorage.removeItem('oscarspa.user') } catch { /* no-op */ }
  }, [])

  const canAccess = useCallback((key) => {
    if (!user) return false
    const a = mock.ROLE_ACCESS[user.role]
    return a === '*' || a.includes(key)
  }, [user])

  // --- Çakışma kontrolü (Sayfa 05: aynı terapist/oda aynı saatte olamaz) ----
  const findConflict = useCallback((draft, ignoreId = null) => {
    for (const a of appointments) {
      if (a.id === ignoreId || a.status === 'done') continue
      if (!overlap(draft.time, draft.end, a.time, a.end)) continue
      if (draft.therapistId && a.therapistId === draft.therapistId)
        return { type: 'therapist', name: a.therapist, with: a }
      if (draft.roomId && a.roomId === draft.roomId) {
        // hamam kapasitesi > 1 ise blok etmez (ücretsiz hamam yine bloklar ama kapasiteye kadar)
        const room = rooms.find((r) => r.id === a.roomId)
        const cap = room?.capacity ?? 1
        const sameSlot = appointments.filter(
          (x) => x.roomId === draft.roomId && x.status !== 'done' && overlap(draft.time, draft.end, x.time, x.end)
        ).length
        if (cap <= 1 || sameSlot >= cap) return { type: 'room', name: a.room, with: a }
      }
    }
    return null
  }, [appointments, rooms])

  const addAppointment = useCallback((draft) => {
    const conflict = findConflict(draft)
    if (conflict) {
      toast(
        conflict.type === 'therapist'
          ? `${conflict.name} bu saatte dolu — çakışma engellendi`
          : `${conflict.name} bu saatte dolu — çakışma engellendi`,
        'warn'
      )
      return false
    }
    setAppointments((list) => [...list, { ...draft, id: uid() }])
    toast('Randevu oluşturuldu')
    return true
  }, [findConflict, toast])

  const cancelAppointment = useCallback((id) => {
    setAppointments((l) => l.filter((a) => a.id !== id))
    toast('Randevu iptal edildi')
  }, [toast])

  // --- Randevu güncelleme (düzenleme + sürükle-bırak) -----------------------
  const updateAppointment = useCallback((id, patch, opts = {}) => {
    const cur = appointments.find((a) => a.id === id)
    if (!cur) return false
    const draft = { ...cur, ...patch }
    const conflict = findConflict(
      { time: draft.time, end: draft.end, therapistId: draft.therapistId, roomId: draft.roomId },
      id
    )
    if (conflict) {
      toast(`${conflict.name} bu saatte dolu — çakışma engellendi`, 'warn')
      return false
    }
    setAppointments((l) => l.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    if (!opts.silent) toast('Randevu güncellendi')
    return true
  }, [appointments, findConflict, toast])

  // --- Paket yardımcıları ---------------------------------------------------
  const activePackageFor = useCallback(
    (guestId) => packages.find((p) => p.guestId === guestId && p.used < p.total),
    [packages]
  )
  const usePackageSession = useCallback((pkgId) => {
    setPackages((l) => l.map((p) => (p.id === pkgId ? { ...p, used: Math.min(p.total, p.used + 1) } : p)))
  }, [])

  // --- Adisyon kapatma (Sayfa 08/09): prim ödeme anındaki terapiste yazılır --
  // override: girişte karar verilen randevularda seçilen gerçek hizmet
  //           { serviceName, price, commissionType }
  // payType 'package' -> tutar 0, misafirin paketinden 1 seans düşülür
  const closeTicket = useCallback((appt, { therapistId, payType, hideAfter, override, packageId }) => {
    const service = mock.services.find((s) => s.id === appt.serviceId)
    // etkin prim tipi: adisyonda seçilen > randevuda kayıtlı > hizmet tanımı
    const effType = override?.commissionType ?? appt.commissionType ?? service?.commissionType
    const isFree = appt.freeHammam || effType === 'none'
    const fromPackage = payType === 'package'
    const amount = fromPackage ? 0 : (override?.price ?? appt.price)
    const serviceName = (override?.serviceName ?? appt.service) + (fromPackage ? ' (Paketten)' : '')
    const therapist = mock.therapists.find((t) => t.id === therapistId)
    const commissionUsd = isFree ? 0 : mock.commissionFor(effType)

    const sale = {
      id: uid(), no: 'SP-' + Math.floor(1000 + Math.random() * 9000),
      apptId: appt.id, guest: appt.guest, roomNo: '',
      service: serviceName, amount,
      therapist: isFree ? '—' : (therapist?.name || appt.therapist || '—'),
      therapistId: isFree ? null : therapistId,
      payType, commissionUsd, date: 'Bugün', archived: true,
    }
    setSales((s) => [sale, ...s])
    if (!isFree && commissionUsd > 0) {
      setCommissions((c) => [
        { id: uid(), saleId: sale.id, therapistId, therapist: therapist?.name, type: effType, usd: commissionUsd, paid: false, date: 'Bugün' },
        ...c,
      ])
    }
    // randevu tamamlandı; istenirse takvimden gizlenir (arşivde kalır)
    setAppointments((l) => l.map((a) => a.id === appt.id
      ? { ...a, status: 'done', pay: payType, service: serviceName, price: amount,
          therapistId: isFree ? null : therapistId, therapist: isFree ? null : (therapist?.name || a.therapist) }
      : a))
    if (hideAfter) setHiddenAppts((h) => [...h, appt.id])
    if (fromPackage && packageId) usePackageSession(packageId)

    toast(isFree
      ? 'Ücretsiz işlem tamamlandı — prim yazılmadı'
      : fromPackage
        ? `Paketten 1 seans düşüldü — prim ${therapist?.name}'e yazıldı (${mock.fmtUSD(commissionUsd)})`
        : `Ödeme alındı — prim ${therapist?.name}'e yazıldı (${mock.fmtUSD(commissionUsd)})`)
    return sale
  }, [toast, usePackageSession])

  // --- Spa floor durum değişimi (manuel) ------------------------------------
  const setRoomStatus = useCallback((roomId, status) => {
    setRooms((l) => l.map((r) => (r.id === roomId ? { ...r, status,
      note: status === 'maint' ? 'Bakım' : status === 'clean' ? 'Temizlik' : r.note,
      time: mock.STATUS_META[status].label } : r)))
  }, [])

  const adjustStock = useCallback((id, delta) => {
    setInventory((l) => l.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)))
  }, [])
  const addInventory = useCallback((data) => {
    setInventory((l) => [...l, { ...data, id: 'inv_' + uid() }])
    toast('Ürün eklendi')
  }, [toast])

  // --- Hizmet & paket ekleme -----------------------------------------------
  const addService = useCallback((data) => {
    setServices((l) => [...l, { ...data, id: 'svc_' + uid() }])
    toast(`Hizmet eklendi: ${data.name}`)
  }, [toast])
  const addPackage = useCallback((data) => {
    setPackages((l) => [{ ...data, id: 'pkg_' + uid(), used: 0 }, ...l])
    toast(`Paket satıldı: ${data.name}`)
  }, [toast])

  const visibleAppointments = useMemo(
    () => appointments.filter((a) => !hiddenAppts.includes(a.id)),
    [appointments, hiddenAppts]
  )

  const value = {
    ...mock,
    user, login, logout, canAccess,
    appointments, visibleAppointments, addAppointment, cancelAppointment, updateAppointment, findConflict, closeTicket,
    rooms, setRoomStatus,
    inventory, adjustStock, addInventory,
    services, addService,
    packages, addPackage, activePackageFor,
    sales, commissions,
    toast, toasts,
    sidebarOpen, setSidebarOpen,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
