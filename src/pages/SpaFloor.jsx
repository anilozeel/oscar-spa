import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Helper } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function SpaFloor() {
  const { rooms, STATUS_META, setRoomStatus, ROOM_TYPE_LABEL } = useStore()
  const [menu, setMenu] = useState(null)

  return (
    <div className="page" onClick={() => setMenu(null)}>
      <PageHead
        title="Spa Floor Ekranı"
        sub="Spa müdürü ekrana baktığında hangi oda dolu, hangisi müsait anında görmeli."
      />

      <div className="legend" style={{ marginBottom: 20 }}>
        {Object.entries(STATUS_META).map(([k, m]) => (
          <span className="li" key={k}><span className={`status-dot dot-${m.cls}`} />{m.label}</span>
        ))}
      </div>

      <div className="grid g-4">
        {rooms.map((r) => {
          const m = STATUS_META[r.status]
          return (
            <div key={r.id} className={`st-${m.cls}`}
              style={{ borderRadius: 'var(--r-lg)', padding: 20, position: 'relative', cursor: 'pointer', minHeight: 150 }}
              onClick={(e) => { e.stopPropagation(); setMenu(menu === r.id ? null : r.id) }}>
              <div className="between">
                <div style={{ fontWeight: 700, fontSize: 18 }}>{r.name}</div>
                <span className={`status-dot dot-${m.cls}`} style={{ width: 12, height: 12 }} />
              </div>
              <div style={{ fontWeight: 600, marginTop: 12 }}>{r.time}</div>
              <div style={{ marginTop: 6, opacity: .9 }}>{r.note}</div>
              <div style={{ marginTop: 3, opacity: .75, fontSize: 13 }}>{r.sub}</div>
              <div style={{ position: 'absolute', bottom: 14, right: 16, fontSize: 11.5, opacity: .6, textTransform: 'uppercase', letterSpacing: .5 }}>
                {ROOM_TYPE_LABEL[r.type]} · {r.capacity} kişi
              </div>

              {menu === r.id && (
                <div className="card" onClick={(e) => e.stopPropagation()}
                  style={{ position: 'absolute', top: 46, right: 12, zIndex: 20, padding: 6, minWidth: 150, boxShadow: 'var(--shadow-md)' }}>
                  {Object.entries(STATUS_META).map(([k, mm]) => (
                    <button key={k} onClick={() => { setRoomStatus(r.id, k); setMenu(null) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', border: 'none', background: r.status === k ? 'var(--sage-tint)' : 'none', padding: '9px 11px', borderRadius: 9, color: 'var(--ink)', fontWeight: 500, fontSize: 13.5 }}>
                      <span className={`status-dot dot-${mm.cls}`} />{mm.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="section-gap">
        <Helper>
          <b>Gerçek zamanlı:</b> Randevu değiştiğinde oda kartı otomatik güncellenir; bakım/temizlik durumu bir karta tıklayarak manuel değiştirilebilir.
        </Helper>
      </div>
    </div>
  )
}
