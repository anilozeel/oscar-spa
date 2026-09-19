import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Button, Badge, Modal, Helper } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const fmtMin = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const addMin = (t, m) => fmtMin(toMin(t) + m)

const SLOTS = []
for (let h = 9; h <= 20; h++) { SLOTS.push(`${String(h).padStart(2, '0')}:00`); if (h < 20) SLOTS.push(`${String(h).padStart(2, '0')}:30`) }

// Takvim gün aralığı
const DAY_START = 9 * 60      // 09:00
const DAY_END = 22 * 60       // 22:00
const PXPM = 1                // 1 piksel / dakika  (30 dk = 30px)
const GRID = []
for (let m = DAY_START; m < DAY_END; m += 30) GRID.push({ min: m, label: fmtMin(m), hour: m % 60 === 0 })

const STATUS_TAG = {
  booked: { label: 'Planlandı', kind: 'sage' },
  inservice: { label: 'İşlemde', kind: 'free' },
  done: { label: 'Tamamlandı', kind: 'vip' },
}

export default function Appointments() {
  const store = useStore()
  const { visibleAppointments, therapists, fmtTRY, updateAppointment, toast } = store
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [view, setView] = useState('day')
  const [offset, setOffset] = useState(0)
  const [hidden, setHidden] = useState(() => new Set()) // gizlenen terapist sütunları

  const base = new Date(); base.setDate(base.getDate() + offset)
  const dateLabel = base.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const dayAppts = offset === 0 ? visibleAppointments : []

  const toggle = (id) => setHidden((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  // Sürükle-bırak ile yeniden planlama (terapist sütunu + saat)
  const onReschedule = (id, colId, slotMin) => {
    const a = visibleAppointments.find((x) => x.id === id); if (!a) return
    const dur = toMin(a.end) - toMin(a.time)
    const newTime = fmtMin(Math.max(DAY_START, Math.min(slotMin, DAY_END - dur)))
    const patch = { time: newTime, end: addMin(newTime, dur) }
    if (colId === 'none') {
      if (!a.freeHammam && !a.undecided) { toast('Bu randevu bir terapist gerektirir', 'warn'); return }
      patch.therapistId = null; patch.therapist = null
    } else if (colId !== a.therapistId) {
      const t = therapists.find((x) => x.id === colId)
      patch.therapistId = colId; patch.therapist = t?.name
    }
    updateAppointment(id, patch)
  }

  return (
    <div className="page">
      <PageHead
        title="Randevu Takvimi"
        sub="Terapist bazlı günlük görünüm — her randevu ilgili terapistin sütununda görünür."
        action={
          <div className="center gap">
            <div className="seg">
              <button className={view === 'day' ? 'on' : ''} onClick={() => setView('day')}>Günlük görünüm</button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>Liste</button>
            </div>
            <Button icon="plus" onClick={() => setOpen(true)}>Yeni Randevu</Button>
          </div>
        }
      />

      {/* Araç çubuğu: tarih navigasyonu + terapist filtresi */}
      <div className="cal-toolbar">
        <div className="center gap-sm">
          <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setOffset((o) => o - 1)}><Icon.chevron style={{ transform: 'rotate(90deg)' }} /></button>
          <div className="cal-date">{dateLabel}</div>
          <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setOffset((o) => o + 1)}><Icon.chevronR /></button>
          <Button variant="ghost" sm onClick={() => setOffset(0)}>Bugün</Button>
        </div>
        <div className="center gap-sm wrap">
          {therapists.filter((t) => t.active).map((t) => (
            <button key={t.id} className={`tf-chip ${hidden.has(t.id) ? 'off' : ''}`} onClick={() => toggle(t.id)}>
              <span className="tf-dot" style={{ background: t.color }} />{t.name}
            </button>
          ))}
        </div>
      </div>

      {view === 'day' ? (
        <DayCalendar appts={dayAppts} therapists={therapists.filter((t) => t.active && !hidden.has(t.id))} onPick={setDetail} onReschedule={onReschedule} empty={offset !== 0} />
      ) : (
        <Panel className="section-gap" title={dateLabel}>
          <table className="table">
            <thead><tr><th>Saat</th><th>Hizmet</th><th>Misafir</th><th>Terapist</th><th>Oda</th><th className="num">Tutar</th><th>Durum</th></tr></thead>
            <tbody>
              {[...dayAppts].sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(a)}>
                  <td className="nowrap" style={{ fontWeight: 600 }}>{a.time}</td>
                  <td>{a.service} <Tags a={a} /></td>
                  <td>{a.guest}</td>
                  <td className={!a.therapist ? 'muted' : ''}>{a.therapist || '—'}</td>
                  <td>{a.room}</td>
                  <td className="num money">{a.price ? fmtTRY(a.price) : '—'}</td>
                  <td><Badge kind={STATUS_TAG[a.status].kind}>{STATUS_TAG[a.status].label}</Badge></td>
                </tr>
              ))}
              {!dayAppts.length && <tr><td colSpan="7" className="muted" style={{ textAlign: 'center', padding: 30 }}>Bu güne ait randevu yok.</td></tr>}
            </tbody>
          </table>
        </Panel>
      )}

      <div className="section-gap">
        <Helper><b>İpucu:</b> Randevuyu başka bir terapiste veya saate <b>sürükleyip bırakın</b>; düzenlemek için üstüne <b>tıklayın</b>. Aynı terapist/oda aynı saatte ikinci kez rezerve edilemez — sistem çakışmayı engeller.</Helper>
      </div>

      {open && <NewAppointment store={store} onClose={() => setOpen(false)} />}
      {detail && <EditAppt appt={detail} store={store} onClose={() => setDetail(null)} />}
    </div>
  )
}

function Tags({ a }) {
  return (
    <>
      {a.variant === 'package' && <Badge kind="sage">PAKET</Badge>}
      {a.freeHammam && <Badge kind="free">ÜCRETSİZ</Badge>}
      {a.undecided && <Badge kind="free">KARAR BEKLİYOR</Badge>}
    </>
  )
}

// ---- Terapist sütunlu günlük takvim (pointer tabanlı sürükle-bırak) ---------
function DayCalendar({ appts, therapists, onPick, onReschedule, empty }) {
  const cols = [...therapists.map((t) => ({ id: t.id, name: t.name, color: t.color }))]
  const hasNone = appts.some((a) => !a.therapistId)
  if (hasNone) cols.push({ id: 'none', name: 'Terapistsiz / Hamam', color: '#b8935a' })
  const bodyH = DAY_END - DAY_START

  const colEls = useRef([])        // sütun DOM referansları
  const startRef = useRef(null)    // aktif sürükleme başlangıç bilgisi
  const [drag, setDrag] = useState(null) // { id, x, y, w, appt, colIndex }

  const colIndexAtX = (x) => {
    for (let i = 0; i < colEls.current.length; i++) {
      const el = colEls.current[i]; if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x < r.right) return i
    }
    return -1
  }
  const topToMin = (topY, colIdx) => {
    const el = colEls.current[colIdx] ?? colEls.current[0]
    if (!el) return DAY_START
    const r = el.getBoundingClientRect()
    return DAY_START + Math.round((topY - r.top) / 15) * 15
  }

  const onPointerDown = (e, a, colIndex) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    startRef.current = {
      id: a.id, appt: a, colIndex,
      startX: e.clientX, startY: e.clientY,
      offX: e.clientX - r.left, offY: e.clientY - r.top, w: r.width, moved: false,
    }
  }
  const onPointerMove = (e) => {
    const s = startRef.current; if (!s) return
    if (!s.moved) {
      if (Math.abs(e.clientX - s.startX) < 4 && Math.abs(e.clientY - s.startY) < 4) return
      s.moved = true
    }
    setDrag({ id: s.id, appt: s.appt, w: s.w, x: e.clientX - s.offX, y: e.clientY - s.offY, colIndex: colIndexAtX(e.clientX) })
  }
  const onPointerUp = (e) => {
    const s = startRef.current; if (!s) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    const moved = s.moved
    if (!moved) { startRef.current = null; setDrag(null); onPick(s.appt); return }
    let colIdx = colIndexAtX(e.clientX); if (colIdx < 0) colIdx = s.colIndex
    const min = topToMin(e.clientY - s.offY, colIdx)
    startRef.current = null; setDrag(null)
    onReschedule(s.id, cols[colIdx].id, min)
  }
  const onPointerCancel = () => { startRef.current = null; setDrag(null) }

  return (
    <div className="tcal-wrap section-gap">
      <div className="tcal" style={{ minWidth: 120 + cols.length * 180 }}>
        <div className="tcal-head">
          <div className="tcal-corner" />
          {cols.map((c, ci) => (
            <div key={c.id} className={`tcal-th ${drag && drag.colIndex === ci ? 'target' : ''}`} style={{ background: c.color }}>{c.name}</div>
          ))}
        </div>
        <div className="tcal-body">
          <div className="tcal-gutter" style={{ height: bodyH }}>
            {GRID.map((g) => (
              <div key={g.min} className="tcal-time" style={{ height: 30 }}>{g.hour ? g.label : ''}</div>
            ))}
          </div>
          {cols.map((c, ci) => {
            const list = appts.filter((a) => (c.id === 'none' ? !a.therapistId : a.therapistId === c.id))
            return (
              <div key={c.id} ref={(el) => (colEls.current[ci] = el)}
                className={`tcal-col ${drag && drag.colIndex === ci ? 'drop-target' : ''}`} style={{ height: bodyH }}>
                {GRID.map((g) => <div key={g.min} className={`tcal-slot ${g.hour ? 'hour' : ''}`} style={{ height: 30 }} />)}
                {list.map((a) => {
                  const top = (toMin(a.time) - DAY_START) * PXPM
                  const h = Math.max((toMin(a.end) - toMin(a.time)) * PXPM, 26)
                  return (
                    <button key={a.id} className={`tcal-appt ${drag?.id === a.id ? 'dragging' : ''}`}
                      onPointerDown={(e) => onPointerDown(e, a, ci)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerCancel}
                      style={{ top, height: h, background: c.color, opacity: a.status === 'done' ? 0.55 : 1 }}>
                      <div className="ta-time">{a.time} – {a.end}</div>
                      <div className="ta-name">{a.guest} · {a.service}{a.variant === 'package' ? ' (PAKET)' : ''}</div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sürüklenen kopya (hayalet) — hedef terapistin rengini alır */}
      {drag && drag.moved !== false && (
        <div className="tcal-ghost" style={{
          left: drag.x, top: drag.y, width: drag.w,
          background: cols[drag.colIndex >= 0 ? drag.colIndex : 0]?.color || '#2c4a38',
        }}>
          <div className="ta-time">{drag.appt.time} – {drag.appt.end}</div>
          <div className="ta-name">{drag.appt.guest} · {drag.appt.service}</div>
        </div>
      )}

      {empty && <div className="empty" style={{ padding: 24 }}>Bu güne ait randevu yok. <b>Bugün</b>’e dönün veya yeni randevu ekleyin.</div>}
    </div>
  )
}

// ---- Randevu düzenleme -------------------------------------------------------
const DURATIONS = [30, 40, 45, 50, 60, 75, 80, 90, 120]

function EditAppt({ appt, store, onClose }) {
  const { therapists, rooms, guests, fmtTRY, updateAppointment, cancelAppointment } = store
  const nav = useNavigate()
  const [time, setTime] = useState(appt.time)
  const [dur, setDur] = useState(toMin(appt.end) - toMin(appt.time))
  const [therapistId, setTherapistId] = useState(appt.therapistId || '')
  const [roomId, setRoomId] = useState(appt.roomId || '')
  const [guestId, setGuestId] = useState(appt.guestId || guests[0].id)
  const [price, setPrice] = useState(appt.price || 0)
  const [status, setStatus] = useState(appt.status)

  const end = addMin(time, Number(dur))
  const durOptions = DURATIONS.includes(dur) ? DURATIONS : [dur, ...DURATIONS]

  const save = () => {
    const t = therapists.find((x) => x.id === therapistId)
    const r = rooms.find((x) => x.id === roomId)
    const g = guests.find((x) => x.id === guestId)
    const ok = updateAppointment(appt.id, {
      time, end,
      therapistId: therapistId || null, therapist: t?.name || null,
      roomId: roomId || null, room: r?.name || appt.room,
      guestId, guest: g?.name || appt.guest,
      price: Number(price), status,
    })
    if (ok) onClose()
  }
  const remove = () => { cancelAppointment(appt.id); onClose() }

  return (
    <Modal title="Randevuyu Düzenle" sub={`${appt.service}`} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={remove} style={{ marginRight: 'auto', color: 'var(--danger)' }}>İptal Et</Button>
        <Button variant="ghost" onClick={onClose}>Kapat</Button>
        <Button icon="check" onClick={save}>Kaydet</Button>
      </>}>
      <div className="center gap-sm wrap" style={{ marginBottom: 14 }}><Tags a={appt} /></div>

      <div className="grid g-2" style={{ gap: 14 }}>
        <div className="field">
          <label>Başlangıç saati</label>
          <select className="select" value={time} onChange={(e) => setTime(e.target.value)}>
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Süre (dk) · bitiş {end}</label>
          <select className="select" value={dur} onChange={(e) => setDur(Number(e.target.value))}>
            {durOptions.map((d) => <option key={d} value={d}>{d} dk</option>)}
          </select>
        </div>
      </div>

      <div className="grid g-2" style={{ gap: 14, marginTop: 14 }}>
        <div className="field">
          <label>Terapist</label>
          <select className="select" value={therapistId} onChange={(e) => setTherapistId(e.target.value)}>
            <option value="">Terapistsiz</option>
            {therapists.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Oda</label>
          <select className="select" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid g-2" style={{ gap: 14, marginTop: 14 }}>
        <div className="field">
          <label>Misafir</label>
          <select className="select" value={guestId} onChange={(e) => setGuestId(e.target.value)}>
            {guests.map((g) => <option key={g.id} value={g.id}>{g.name} · Oda {g.roomNo}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Fiyat (₺)</label>
          <input className="input" type="number" min="0" step="50" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label>Durum</label>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="booked">Planlandı</option>
          <option value="inservice">İşlemde</option>
          <option value="done">Tamamlandı</option>
        </select>
      </div>

      {appt.status !== 'done' && (
        <Button block variant="ghost" icon="pos" style={{ marginTop: 16 }} onClick={() => { onClose(); nav('/satis') }}>
          Adisyona / Ödemeye Git
        </Button>
      )}
    </Modal>
  )
}

// ---- Yeni randevu akışı ------------------------------------------------------
function NewAppointment({ store, onClose }) {
  const { services, therapists, rooms, guests, fmtTRY, addAppointment, findConflict,
          ROOM_TYPE_LABEL, UNDECIDED_SERVICE, PACKAGE_DURATION, PACKAGE_INFO } = store
  const [step, setStep] = useState(0)
  const [svc, setSvc] = useState(null)
  const [variant, setVariant] = useState('solo')
  const [time, setTime] = useState('15:00')
  const [therapistId, setTherapistId] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [guestId, setGuestId] = useState(guests[0].id)

  const isFree = !!svc?.free
  const isUndecided = !!svc?.undecided
  const isPackage = svc?.hasPackage && variant === 'package'

  const price = !svc ? 0 : (svc.hasPackage ? (isPackage ? svc.pkgPrice : svc.price) : svc.price)
  const duration = !svc ? 0 : (isPackage ? PACKAGE_DURATION : svc.duration)
  const commissionType = !svc ? 'none' : (svc.hasPackage ? (isPackage ? 'package' : 'massage') : svc.commissionType)
  const end = svc ? addMin(time, duration) : time
  const draftBase = { time, end }

  const freeTherapists = useMemo(() =>
    therapists.filter((t) => t.active && !findConflict({ ...draftBase, therapistId: t.id })),
    [time, end, therapists])
  const freeRooms = useMemo(() =>
    rooms.filter((r) => svc?.roomTypes.includes(r.type) && !findConflict({ ...draftBase, roomId: r.id })),
    [time, end, svc, rooms])

  const STEPS = isFree
    ? ['Hizmet', 'Süre & Saat', 'Oda', 'Onay']
    : ['Hizmet', 'Süre & Saat', 'Terapist', 'Oda', 'Onay']

  const guest = guests.find((g) => g.id === guestId)
  const therapist = therapists.find((t) => t.id === therapistId)
  const room = rooms.find((r) => r.id === roomId)

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))
  const pickService = (s) => { setSvc(s); setVariant('solo'); setTherapistId(null); setRoomId(null) }

  const confirm = () => {
    const ok = addAppointment({
      time, end, serviceId: svc.id, service: svc.name,
      variant: svc.hasPackage ? variant : null, commissionType,
      therapistId: isFree ? null : therapistId,
      therapist: isFree ? null : therapist?.name,
      roomId, room: room?.name, guestId, guest: guest?.name,
      price, status: 'booked', pay: null, freeHammam: isFree, undecided: isUndecided,
    })
    if (ok) onClose()
  }

  const realStep = STEPS[step]
  const canNext =
    realStep === 'Hizmet' ? !!svc :
    realStep === 'Süre & Saat' ? !!time :
    realStep === 'Terapist' ? !!therapistId :
    realStep === 'Oda' ? !!roomId : true

  return (
    <Modal title="Yeni Randevu" sub="Hizmeti seçin; sistem uygun terapist ve odayı önersin." onClose={onClose} wide
      footer={
        <>
          {step > 0 && <Button variant="ghost" onClick={back}>Geri</Button>}
          {realStep !== 'Onay'
            ? <Button icon="chevronR" disabled={!canNext} onClick={next}>Devam</Button>
            : <Button icon="check" onClick={confirm}>Randevuyu Oluştur</Button>}
        </>
      }>
      <div className="steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`}>
            <span className="n">{i < step ? '✓' : i + 1}</span>
            <span className="s-lbl">{s}</span>
            {i < STEPS.length - 1 && <span className="bar" />}
          </div>
        ))}
      </div>

      {realStep === 'Hizmet' && (
        <div className="pick-grid">
          {services.map((s) => (
            <button key={s.id} className={`pick ${svc?.id === s.id ? 'on' : ''}`} onClick={() => pickService(s)}>
              <div className="p-t">{s.name} {s.free && <Badge kind="free">ÜCRETSİZ</Badge>} {s.tag && <Badge kind="gold">{s.tag}</Badge>}</div>
              <div className="p-s">
                {s.cat} · {s.duration} dk · {s.price ? fmtTRY(s.price) : '₺0'}
                {s.hasPackage && <> · Paket {fmtTRY(s.pkgPrice)}</>}
              </div>
            </button>
          ))}
          <button className={`pick decide ${svc?.id === 'undecided' ? 'on' : ''}`} onClick={() => pickService(UNDECIDED_SERVICE)}>
            <div className="p-t"><Icon.clock style={{ width: 15, height: 15, verticalAlign: '-2px' }} /> Müşteri gelince karar verecek</div>
            <div className="p-s">Slotu şimdi ayır; hizmet girişte / ödeme anında belirlenir</div>
          </button>
        </div>
      )}

      {realStep === 'Süre & Saat' && (
        <>
          {svc.hasPackage && (
            <div className="field" style={{ marginBottom: 16 }}>
              <label>Satış türü</label>
              <div className="seg" style={{ width: '100%' }}>
                <button className={variant === 'solo' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setVariant('solo')}>Sadece Masaj · {fmtTRY(svc.price)}</button>
                <button className={variant === 'package' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setVariant('package')}>Paket · {fmtTRY(svc.pkgPrice)}</button>
              </div>
              {isPackage && <p className="muted small" style={{ marginTop: 8 }}>{PACKAGE_INFO}</p>}
            </div>
          )}
          <div className="grid g-2" style={{ gap: 16 }}>
            <div className="field">
              <label>Başlangıç saati</label>
              <select className="select" value={time} onChange={(e) => setTime(e.target.value)}>
                {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Süre & Fiyat</label>
              <div className="input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)' }}>
                <span>{duration} dk · {time}–{end}</span>
                <b>{price ? fmtTRY(price) : '₺0'}</b>
              </div>
            </div>
          </div>
          {isFree && <div style={{ marginTop: 14 }}><Helper>Ücretsiz hamam kullanımı: terapist seçimi istenmez, tutar ve prim ₺0’dır — ancak hamam kapasitesini yine de bloke eder.</Helper></div>}
          {isUndecided && <div style={{ marginTop: 14 }}><Helper>Karar bekleyen randevu: slot (terapist + oda + saat) şimdi ayrılır. Gerçek hizmet <b>Satış &amp; POS</b> ekranında seçilir; fiyat ve prim o an belirlenir.</Helper></div>}
        </>
      )}

      {realStep === 'Terapist' && (
        <>
          <p className="muted small" style={{ marginBottom: 12 }}>{time}–{end} arası uygun terapistler:</p>
          <div className="pick-grid">
            {therapists.map((t) => {
              const free = freeTherapists.some((f) => f.id === t.id)
              return (
                <button key={t.id} disabled={!free} className={`pick ${therapistId === t.id ? 'on' : ''}`} onClick={() => setTherapistId(t.id)}>
                  <div className="p-t"><span className="tf-dot" style={{ background: t.color }} /> {t.name}</div>
                  <div className="p-s">{free ? 'Müsait' : 'Bu saatte dolu'} · {t.shift}</div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {realStep === 'Oda' && (
        <>
          <p className="muted small" style={{ marginBottom: 12 }}>{svc.name} için uygun {svc.roomTypes.map((t) => ROOM_TYPE_LABEL[t]).join(' / ')}:</p>
          <div className="pick-grid">
            {rooms.filter((r) => svc.roomTypes.includes(r.type)).map((r) => {
              const free = freeRooms.some((f) => f.id === r.id)
              return (
                <button key={r.id} disabled={!free} className={`pick ${roomId === r.id ? 'on' : ''}`} onClick={() => setRoomId(r.id)}>
                  <div className="p-t">{r.name}</div>
                  <div className="p-s">{ROOM_TYPE_LABEL[r.type]} · {free ? 'Müsait' : 'Dolu / uygun değil'}</div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {realStep === 'Onay' && (
        <div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Misafir</label>
            <select className="select" value={guestId} onChange={(e) => setGuestId(e.target.value)}>
              {guests.map((g) => <option key={g.id} value={g.id}>{g.name} · Oda {g.roomNo}</option>)}
            </select>
          </div>
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <div className="kv"><span className="k">Hizmet</span><span className="v">{isUndecided ? 'Girişte belirlenecek' : svc.name}{isPackage ? ' · Paket' : (svc.hasPackage ? ' · Sadece Masaj' : '')}</span></div>
            <div className="kv"><span className="k">Saat</span><span className="v">{time}–{end} ({duration} dk)</span></div>
            <div className="kv"><span className="k">Terapist</span><span className="v">{isFree ? 'Terapistsiz (ücretsiz hamam)' : therapist?.name}</span></div>
            <div className="kv"><span className="k">Oda</span><span className="v">{room?.name}</span></div>
            <div className="kv"><span className="k">Misafir</span><span className="v">{guest?.name}</span></div>
            <div className="kv"><span className="k">Tutar</span><span className="v money">{isUndecided ? 'Girişte belirlenecek' : (price ? fmtTRY(price) : '₺0')}</span></div>
          </div>
        </div>
      )}
    </Modal>
  )
}
