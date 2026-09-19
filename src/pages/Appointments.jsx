import { useState, useMemo } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Button, Badge, Modal, Helper } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const addMin = (t, m) => {
  const [h, mm] = t.split(':').map(Number)
  const total = h * 60 + mm + m
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
const SLOTS = []
for (let h = 9; h <= 20; h++) { SLOTS.push(`${String(h).padStart(2, '0')}:00`); if (h < 20) SLOTS.push(`${String(h).padStart(2, '0')}:30`) }

const STATUS_TAG = {
  booked: { label: 'Planlandı', kind: 'sage' },
  inservice: { label: 'İşlemde', kind: 'free' },
  done: { label: 'Tamamlandı', kind: 'vip' },
}

export default function Appointments() {
  const store = useStore()
  const { visibleAppointments, HOURS, fmtTRY } = store
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('timeline')

  const byHour = useMemo(() => {
    const map = {}
    HOURS.forEach((h) => { map[h] = [] })
    visibleAppointments.forEach((a) => {
      const hour = a.time.slice(0, 2) + ':00'
      ;(map[hour] ||= []).push(a)
    })
    Object.values(map).forEach((arr) => arr.sort((x, y) => x.time.localeCompare(y.time)))
    return map
  }, [visibleAppointments, HOURS])

  return (
    <div className="page">
      <PageHead
        title="Randevu Takvimi"
        sub="Resepsiyon tek ekranda hizmeti seçer; sistem uygun terapist ve odayı otomatik önerir."
        action={
          <div className="center gap">
            <div className="seg">
              <button className={view === 'timeline' ? 'on' : ''} onClick={() => setView('timeline')}>Zaman Çizelgesi</button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>Liste</button>
            </div>
            <Button icon="plus" onClick={() => setOpen(true)}>Yeni Randevu</Button>
          </div>
        }
      />

      <Helper>
        <b>Kritik kural:</b> Aynı terapist ve oda aynı saatte ikinci kez rezerve edilemez. Paket hakkı, oda durumu, terapist mesaisi ve ödeme tipi aynı anda kontrol edilir.
      </Helper>

      <Panel className="section-gap" title={new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={<span className="chip"><Icon.clock /> {visibleAppointments.filter(a => a.status !== 'done').length} aktif randevu</span>}>
        {view === 'timeline' ? (
          <div className="cal">
            {HOURS.map((h) => (
              <Row key={h} hour={h} appts={byHour[h] || []} store={store} />
            ))}
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Saat</th><th>Hizmet</th><th>Misafir</th><th>Terapist</th><th>Oda</th><th className="num">Tutar</th><th>Durum</th></tr></thead>
            <tbody>
              {[...visibleAppointments].sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
                <tr key={a.id}>
                  <td className="nowrap" style={{ fontWeight: 600 }}>{a.time}</td>
                  <td>{a.service} <Tags a={a} /></td>
                  <td>{a.guest}</td>
                  <td className={!a.therapist ? 'muted' : ''}>{a.therapist || '—'}</td>
                  <td>{a.room}</td>
                  <td className="num money">{a.price ? fmtTRY(a.price) : '—'}</td>
                  <td><Badge kind={STATUS_TAG[a.status].kind}>{STATUS_TAG[a.status].label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {open && <NewAppointment store={store} onClose={() => setOpen(false)} />}
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

function Row({ hour, appts, store }) {
  const { fmtTRY } = store
  return (
    <>
      <div className="cal-time">{hour}</div>
      <div className="cal-col">
        <div className="cal-slot">
          {appts.map((a) => (
            <div key={a.id} className={`appt ${a.freeHammam ? 'free-hammam' : ''} ${a.undecided ? 'undecided' : ''} ${a.status === 'done' ? 'done' : ''}`}>
              <div className="a-top">
                <span className="a-svc">{a.service} {a.variant === 'package' && <Badge kind="sage">PAKET</Badge>}</span>
                <span className="a-price">{a.price ? fmtTRY(a.price) : '₺0'}</span>
              </div>
              <div className="a-meta">
                {a.time}–{a.end} · {a.room} · {a.therapist || 'Terapistsiz'} · {a.guest}
                {a.freeHammam && <> · <b style={{ color: 'var(--gold-deep)' }}>HAMAM • ÜCRETSİZ</b></>}
                {a.undecided && <> · <b style={{ color: 'var(--gold-deep)' }}>GİRİŞTE BELİRLENECEK</b></>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ---- 5 adımlı randevu akışı (Sayfa 05) --------------------------------------
function NewAppointment({ store, onClose }) {
  const { services, therapists, rooms, guests, fmtTRY, addAppointment, findConflict,
          ROOM_TYPE_LABEL, UNDECIDED_SERVICE, PACKAGE_DURATION, PACKAGE_INFO } = store
  const [step, setStep] = useState(0)
  const [svc, setSvc] = useState(null)
  const [variant, setVariant] = useState('solo') // solo | package
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

  // Ücretsiz hamamda terapist adımı yok; diğer her şeyde (karar dahil) var
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
      time, end, serviceId: svc.id,
      service: svc.name,
      variant: svc.hasPackage ? variant : null,
      commissionType,
      therapistId: isFree ? null : therapistId,
      therapist: isFree ? null : therapist?.name,
      roomId, room: room?.name, guestId, guest: guest?.name,
      price, status: 'booked', pay: null,
      freeHammam: isFree, undecided: isUndecided,
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
          {/* Müşteri gelince karar verecek */}
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
                <button className={variant === 'solo' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setVariant('solo')}>
                  Sadece Masaj · {fmtTRY(svc.price)}
                </button>
                <button className={variant === 'package' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setVariant('package')}>
                  Paket · {fmtTRY(svc.pkgPrice)}
                </button>
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
          {isUndecided && <div style={{ marginTop: 14 }}><Helper>Karar bekleyen randevu: slot (terapist + oda + saat) şimdi ayrılır. Misafir geldiğinde gerçek hizmet <b>Satış &amp; POS</b> ekranında seçilir; fiyat ve prim o an belirlenir.</Helper></div>}
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
                  <div className="p-t">{t.name}</div>
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
