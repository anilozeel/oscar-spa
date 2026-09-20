import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Button, Badge, Modal, Helper } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const fmtMin = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const addMin = (t, m) => fmtMin(toMin(t) + m)
const phoneOk = (p) => String(p || '').replace(/\D/g, '').length >= 7

const SLOTS = []
for (let h = 9; h <= 20; h++) { SLOTS.push(`${String(h).padStart(2, '0')}:00`); if (h < 20) SLOTS.push(`${String(h).padStart(2, '0')}:30`) }

const DAY_START = 9 * 60
const DAY_END = 22 * 60
const PXPM = 1
const GRID = []
for (let m = DAY_START; m < DAY_END; m += 30) GRID.push({ min: m, label: fmtMin(m), hour: m % 60 === 0 })

const STATUS_TAG = {
  booked: { label: 'Planlandı', kind: 'sage' },
  inservice: { label: 'İşlemde', kind: 'free' },
  done: { label: 'Tamamlandı', kind: 'vip' },
}

export default function Appointments() {
  const store = useStore()
  const { visibleAppointments, therapists, fmtTRY, updateAppointment, toast, user } = store
  const isTherapist = user?.role === 'therapist'
  const myId = user?.therapistId
  const [open, setOpen] = useState(false)
  const [prefill, setPrefill] = useState(null)
  const [detail, setDetail] = useState(null)
  const [view, setView] = useState('day')
  const [offset, setOffset] = useState(0)
  const [hidden, setHidden] = useState(() => new Set())

  const base = new Date(); base.setDate(base.getDate() + offset)
  const dateLabel = base.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const dayAppts = offset === 0
    ? (isTherapist ? visibleAppointments.filter((a) => a.therapistId === myId) : visibleAppointments)
    : []
  const calTherapists = isTherapist
    ? therapists.filter((t) => t.id === myId)
    : therapists.filter((t) => t.active && !hidden.has(t.id))

  const toggle = (id) => setHidden((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

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

  const openNew = (colId, min) => {
    setPrefill({ therapistId: colId === 'none' ? null : colId, time: fmtMin(min) })
    setOpen(true)
  }

  return (
    <div className="page">
      <PageHead
        title="Randevu Takvimi"
        sub={isTherapist ? 'Kendi günlük programınız — yalnızca size atanan randevular.' : 'Terapist bazlı günlük görünüm — her randevu ilgili terapistin sütununda görünür.'}
        action={
          <div className="center gap">
            <div className="seg">
              <button className={view === 'day' ? 'on' : ''} onClick={() => setView('day')}>Günlük görünüm</button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>Liste</button>
            </div>
            {!isTherapist && <Button icon="plus" onClick={() => { setPrefill(null); setOpen(true) }}>Yeni Randevu</Button>}
          </div>
        }
      />

      <div className="cal-toolbar">
        <div className="center gap-sm">
          <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setOffset((o) => o - 1)}><Icon.chevron style={{ transform: 'rotate(90deg)' }} /></button>
          <div className="cal-date">{dateLabel}</div>
          <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setOffset((o) => o + 1)}><Icon.chevronR /></button>
          <Button variant="ghost" sm onClick={() => setOffset(0)}>Bugün</Button>
        </div>
        {!isTherapist && (
          <div className="center gap-sm wrap">
            {therapists.filter((t) => t.active).map((t) => (
              <button key={t.id} className={`tf-chip ${hidden.has(t.id) ? 'off' : ''}`} onClick={() => toggle(t.id)}>
                <span className="tf-dot" style={{ background: t.color }} />{t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'day' ? (
        <DayCalendar appts={dayAppts} therapists={calTherapists} onPick={setDetail} onReschedule={onReschedule} onNewAt={openNew} canEdit={!isTherapist} empty={offset !== 0} />
      ) : (
        <Panel className="section-gap" title={dateLabel}>
          <table className="table">
            <thead><tr><th>Saat</th><th>Hizmet</th><th>Misafir</th>{!isTherapist && <th>Terapist</th>}{!isTherapist && <th className="num">Tutar</th>}<th>Durum</th></tr></thead>
            <tbody>
              {[...dayAppts].sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(a)}>
                  <td className="nowrap" style={{ fontWeight: 600 }}>{a.time}</td>
                  <td>{a.service} <Tags a={a} /></td>
                  <td>{a.guest}</td>
                  {!isTherapist && <td className={!a.therapist ? 'muted' : ''}>{a.therapist || '—'}</td>}
                  {!isTherapist && <td className="num money">{a.price ? fmtTRY(a.price) : '—'}</td>}
                  <td><Badge kind={STATUS_TAG[a.status].kind}>{STATUS_TAG[a.status].label}</Badge></td>
                </tr>
              ))}
              {!dayAppts.length && <tr><td colSpan={isTherapist ? 4 : 6} className="muted" style={{ textAlign: 'center', padding: 30 }}>Bu güne ait randevu yok.</td></tr>}
            </tbody>
          </table>
        </Panel>
      )}

      <div className="section-gap">
        <Helper>
          {isTherapist
            ? <><b>Programınız:</b> Yalnızca size atanan randevuları görürsünüz. Detay için randevuya tıklayın; işleme başladığınızda / bitirdiğinizde durumunu güncelleyebilirsiniz.</>
            : <><b>İpucu:</b> Boş saate tıklayarak randevu açın. Randevuyu başka terapiste/saate <b>sürükleyip bırakın</b>; düzenlemek için üstüne <b>tıklayın</b>. Aynı terapist aynı saatte ikinci kez rezerve edilemez.</>}
        </Helper>
      </div>

      {open && !isTherapist && <NewAppointment store={store} prefill={prefill} onClose={() => { setOpen(false); setPrefill(null) }} />}
      {detail && (isTherapist
        ? <ApptView appt={detail} store={store} onClose={() => setDetail(null)} />
        : <EditAppt appt={detail} store={store} onClose={() => setDetail(null)} />)}
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
function DayCalendar({ appts, therapists, onPick, onReschedule, onNewAt, canEdit = true, empty }) {
  const cols = [...therapists.map((t) => ({ id: t.id, name: t.name, color: t.color }))]
  const hasNone = appts.some((a) => !a.therapistId)
  if (hasNone) cols.push({ id: 'none', name: 'Terapistsiz / Hamam', color: '#b8935a' })
  const bodyH = DAY_END - DAY_START

  const colEls = useRef([])
  const startRef = useRef(null)
  const [drag, setDrag] = useState(null)

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
                className={`tcal-col ${drag && drag.colIndex === ci ? 'drop-target' : ''} ${canEdit && onNewAt ? 'bookable' : ''}`}
                style={{ height: bodyH }}
                onClick={canEdit && onNewAt ? (e) => {
                  if (e.target.closest('.tcal-appt')) return
                  const r = e.currentTarget.getBoundingClientRect()
                  let min = DAY_START + Math.round((e.clientY - r.top) / 30) * 30
                  min = Math.max(DAY_START, Math.min(min, 20 * 60))
                  onNewAt(c.id, min)
                } : undefined}>
                {GRID.map((g) => <div key={g.min} className={`tcal-slot ${g.hour ? 'hour' : ''}`} style={{ height: 30 }} />)}
                {list.map((a) => {
                  const top = (toMin(a.time) - DAY_START) * PXPM
                  const h = Math.max((toMin(a.end) - toMin(a.time)) * PXPM, 26)
                  const handlers = canEdit
                    ? { onPointerDown: (e) => onPointerDown(e, a, ci), onPointerMove, onPointerUp, onPointerCancel }
                    : { onClick: () => onPick(a) }
                  return (
                    <button key={a.id} className={`tcal-appt ${drag?.id === a.id ? 'dragging' : ''}`} {...handlers}
                      style={{ top, height: h, background: c.color, opacity: a.status === 'done' ? 0.55 : 1, cursor: canEdit ? undefined : 'pointer' }}>
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

      {drag && (
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

// ---- Randevu görünümü (terapist — salt okunur, para yok) --------------------
function ApptView({ appt, store, onClose }) {
  const { updateAppointment } = store
  const setStatus = (s) => { updateAppointment(appt.id, { status: s }); onClose() }
  return (
    <Modal title={appt.service} sub={`${appt.time} – ${appt.end}`} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Kapat</Button>
        {appt.status === 'booked' && <Button icon="clock" onClick={() => setStatus('inservice')}>İşleme Başla</Button>}
        {appt.status === 'inservice' && <Button icon="check" onClick={() => setStatus('done')}>Tamamla</Button>}
      </>}>
      <div className="center gap-sm wrap" style={{ marginBottom: 14 }}>
        <Badge kind={STATUS_TAG[appt.status].kind}>{STATUS_TAG[appt.status].label}</Badge>
        <Tags a={appt} />
      </div>
      <div className="card" style={{ background: 'var(--surface-2)' }}>
        <div className="kv"><span className="k">Hizmet</span><span className="v">{appt.service}{appt.variant === 'package' ? ' · Paket' : ''}</span></div>
        <div className="kv"><span className="k">Misafir</span><span className="v">{appt.guest}</span></div>
        <div className="kv"><span className="k">Saat</span><span className="v">{appt.time} – {appt.end}</span></div>
      </div>
      <p className="muted small" style={{ marginTop: 12 }}>Fiyat, prim ve ödeme bilgileri terapist görünümünde gösterilmez.</p>
    </Modal>
  )
}

// ---- Randevu düzenleme -------------------------------------------------------
const DURATIONS = [30, 40, 45, 50, 60, 75, 80, 90, 120]

function EditAppt({ appt, store, onClose }) {
  const { services, therapists, fmtTRY, updateAppointment, cancelAppointment, PACKAGE_DURATION } = store
  const nav = useNavigate()
  const [serviceId, setServiceId] = useState(appt.serviceId || 'undecided')
  const [variant, setVariant] = useState(appt.variant || 'solo')
  const [time, setTime] = useState(appt.time)
  const [dur, setDur] = useState(toMin(appt.end) - toMin(appt.time))
  const [therapistId, setTherapistId] = useState(appt.therapistId || '')
  const [guestName, setGuestName] = useState(appt.guest || '')
  const [phone, setPhone] = useState(appt.phone || '')
  const [price, setPrice] = useState(appt.price || 0)
  const [status, setStatus] = useState(appt.status)

  const svc = services.find((s) => s.id === serviceId)  // undefined => "Girişte Belirlenecek"
  const isPackage = svc?.hasPackage && variant === 'package'
  const end = addMin(time, Number(dur))
  const durOptions = DURATIONS.includes(Number(dur)) ? DURATIONS : [Number(dur), ...DURATIONS]

  const onServiceChange = (id) => {
    setServiceId(id)
    const s = services.find((x) => x.id === id)
    if (s) { setVariant('solo'); setPrice(s.price); setDur(s.duration) }
  }
  const onVariant = (v) => {
    setVariant(v)
    if (svc?.hasPackage) { setPrice(v === 'package' ? svc.pkgPrice : svc.price); setDur(v === 'package' ? PACKAGE_DURATION : svc.duration) }
  }

  const canSave = guestName.trim() && phoneOk(phone)

  const save = () => {
    const t = therapists.find((x) => x.id === therapistId)
    const commissionType = svc ? (svc.hasPackage ? (isPackage ? 'package' : 'massage') : svc.commissionType) : (appt.commissionType || 'none')
    const ok = updateAppointment(appt.id, {
      time, end,
      serviceId,
      service: svc ? svc.name : 'Girişte Belirlenecek',
      variant: svc?.hasPackage ? variant : null,
      commissionType,
      undecided: svc ? false : true,
      freeHammam: !!svc?.free,
      therapistId: therapistId || null, therapist: t?.name || null,
      guestId: appt.guestId || null, guest: guestName.trim(),
      phone: phone.trim(),
      price: Number(price), status,
    })
    if (ok) onClose()
  }
  const remove = () => { cancelAppointment(appt.id); onClose() }

  return (
    <Modal title="Randevuyu Düzenle" sub={appt.undecided ? 'Girişte ne seçildiğini buradan kaydedin' : appt.service} onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={remove} style={{ marginRight: 'auto', color: 'var(--danger)' }}>İptal Et</Button>
        <Button variant="ghost" onClick={onClose}>Kapat</Button>
        <Button icon="check" disabled={!canSave} onClick={save}>Kaydet</Button>
      </>}>
      <div className="center gap-sm wrap" style={{ marginBottom: 14 }}><Tags a={appt} /></div>

      {/* Hizmet — girişte karar verilen randevu dahil değiştirilebilir */}
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Hizmet</label>
        <select className="select" value={serviceId} onChange={(e) => onServiceChange(e.target.value)}>
          <option value="undecided">Girişte Belirlenecek</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}{s.price ? ` — ${fmtTRY(s.price)}` : ''}</option>)}
        </select>
      </div>
      {svc?.hasPackage && (
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Satış türü</label>
          <div className="seg" style={{ width: '100%' }}>
            <button className={variant === 'solo' ? 'on' : ''} style={{ flex: 1 }} onClick={() => onVariant('solo')}>Sadece Masaj · {fmtTRY(svc.price)}</button>
            <button className={variant === 'package' ? 'on' : ''} style={{ flex: 1 }} onClick={() => onVariant('package')}>Paket · {fmtTRY(svc.pkgPrice)}</button>
          </div>
        </div>
      )}

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
          <label>Fiyat (₺)</label>
          <input className="input" type="number" min="0" step="50" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>

      <div className="grid g-2" style={{ gap: 14, marginTop: 14 }}>
        <div className="field">
          <label>Misafir adı</label>
          <input className="input" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Misafir adı" />
        </div>
        <div className="field">
          <label>Telefon <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xx xx" />
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

      {!canSave && <p className="small" style={{ color: 'var(--gold-deep)', marginTop: 12 }}>Kaydetmek için misafir adı ve geçerli telefon numarası gerekli.</p>}

      {appt.status !== 'done' && (
        <Button block variant="ghost" icon="pos" style={{ marginTop: 12 }} onClick={() => { onClose(); nav('/satis') }}>
          Adisyona / Ödemeye Git
        </Button>
      )}
    </Modal>
  )
}

// ---- Yeni randevu akışı ------------------------------------------------------
function NewAppointment({ store, prefill, onClose }) {
  const { services, therapists, fmtTRY, addAppointment, findConflict,
          UNDECIDED_SERVICE, PACKAGE_DURATION, PACKAGE_INFO } = store
  const [step, setStep] = useState(0)
  const [svc, setSvc] = useState(null)
  const [variant, setVariant] = useState('solo')
  const [time, setTime] = useState(prefill?.time || '15:00')
  const [therapistId, setTherapistId] = useState(prefill?.therapistId || null)
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')

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

  const STEPS = isFree
    ? ['Hizmet', 'Süre & Saat', 'Onay']
    : ['Hizmet', 'Süre & Saat', 'Terapist', 'Onay']

  const therapist = therapists.find((t) => t.id === therapistId)

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))
  const pickService = (s) => { setSvc(s); setVariant('solo'); setTherapistId(prefill?.therapistId || null) }

  const confirm = () => {
    const ok = addAppointment({
      time, end, serviceId: svc.id, service: svc.name,
      variant: svc.hasPackage ? variant : null, commissionType,
      therapistId: isFree ? null : therapistId,
      therapist: isFree ? null : therapist?.name,
      guestId: null, guest: guestName.trim(), phone: phone.trim(),
      price, status: 'booked', pay: null, freeHammam: isFree, undecided: isUndecided,
    })
    if (ok) onClose()
  }

  const realStep = STEPS[step]
  const canNext =
    realStep === 'Hizmet' ? !!svc :
    realStep === 'Süre & Saat' ? !!time :
    realStep === 'Terapist' ? !!therapistId : true
  const canConfirm = guestName.trim() && phoneOk(phone)

  return (
    <Modal title="Yeni Randevu" sub="Hizmeti seçin; sistem uygun terapisti önersin." onClose={onClose} wide
      footer={
        <>
          {step > 0 && <Button variant="ghost" onClick={back}>Geri</Button>}
          {realStep !== 'Onay'
            ? <Button icon="chevronR" disabled={!canNext} onClick={next}>Devam</Button>
            : <Button icon="check" disabled={!canConfirm} onClick={confirm}>Randevuyu Oluştur</Button>}
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
          {isFree && <div style={{ marginTop: 14 }}><Helper>Ücretsiz hamam kullanımı: terapist seçimi istenmez, tutar ve prim ₺0’dır.</Helper></div>}
          {isUndecided && <div style={{ marginTop: 14 }}><Helper>Karar bekleyen randevu: slot (terapist + saat) şimdi ayrılır. Misafir geldiğinde gerçek hizmeti randevuya tıklayıp <b>Randevuyu Düzenle</b>’den seçebilirsiniz.</Helper></div>}
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

      {realStep === 'Onay' && (
        <div>
          <div className="grid g-2" style={{ gap: 14, marginBottom: 16 }}>
            <div className="field">
              <label>Misafir adı <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" autoFocus value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Örn. Ahmet Yılmaz" />
            </div>
            <div className="field">
              <label>Telefon <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xx xx" />
            </div>
          </div>
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <div className="kv"><span className="k">Hizmet</span><span className="v">{isUndecided ? 'Girişte belirlenecek' : svc.name}{isPackage ? ' · Paket' : (svc.hasPackage ? ' · Sadece Masaj' : '')}</span></div>
            <div className="kv"><span className="k">Saat</span><span className="v">{time}–{end} ({duration} dk)</span></div>
            <div className="kv"><span className="k">Terapist</span><span className="v">{isFree ? 'Terapistsiz (ücretsiz hamam)' : therapist?.name}</span></div>
            <div className="kv"><span className="k">Misafir</span><span className="v">{guestName || '—'}</span></div>
            <div className="kv"><span className="k">Telefon</span><span className="v">{phone || '—'}</span></div>
            <div className="kv"><span className="k">Tutar</span><span className="v money">{isUndecided ? 'Girişte belirlenecek' : (price ? fmtTRY(price) : '₺0')}</span></div>
          </div>
          {!canConfirm && <p className="small" style={{ color: 'var(--gold-deep)', marginTop: 12 }}>Rezervasyonu oluşturmak için misafir adı ve geçerli telefon numarası zorunludur.</p>}
        </div>
      )}
    </Modal>
  )
}
