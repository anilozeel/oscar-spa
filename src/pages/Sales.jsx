import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Badge, Button, Modal, Helper, Chip, Stat } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const PAY = [
  { id: 'cash', label: 'Nakit', icon: 'cash', variant: 'sage' },
  { id: 'card', label: 'Kart', icon: 'card', variant: 'sage' },
  { id: 'folio', label: 'Odaya Yaz', icon: 'room', variant: 'gold' },
]

export default function Sales() {
  const store = useStore()
  const { visibleAppointments, sales, fmtTRY, fmtUSD } = store
  const [ticket, setTicket] = useState(null)
  const openAppts = visibleAppointments.filter((a) => a.status !== 'done')
  const todayRevenue = sales.reduce((s, x) => s + x.amount, 0)
  const todayCommission = sales.reduce((s, x) => s + x.commissionUsd, 0)

  return (
    <div className="page">
      <PageHead title="Satış & POS" sub="Ödeme alınmadan önce işlem, terapist ve prim bilgisi net şekilde kontrol edilmeli." />

      <div className="grid g-3">
        <Stat label="Bugün kapatılan adisyon" value={sales.length} icon="pos" />
        <Stat label="Tahsil edilen (oturum)" value={fmtTRY(todayRevenue)} icon="finance" />
        <Stat label="Yazılan prim (oturum)" value={fmtUSD(todayCommission)} icon="therapist" />
      </div>

      <div className="grid section-gap" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        {/* Açık adisyonlar */}
        <Panel title="Açık Adisyonlar" action={<Chip>{openAppts.length}</Chip>}>
          {openAppts.length ? openAppts.map((a) => (
            <div key={a.id} className="list-row">
              <div className="chip ghost" style={{ minWidth: 62, justifyContent: 'center' }}>{a.time}</div>
              <div className="grow">
                <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>
                  {a.service}{' '}
                  {a.variant === 'package' && <Badge kind="sage">PAKET</Badge>}
                  {a.freeHammam && <Badge kind="free">ÜCRETSİZ</Badge>}
                  {a.undecided && <Badge kind="free">KARAR BEKLİYOR</Badge>}
                </div>
                <div className="muted small">{a.guest} · {a.room} · {a.therapist || 'Terapistsiz'}</div>
              </div>
              <div className="money">{a.price ? fmtTRY(a.price) : (a.undecided ? '—' : '₺0')}</div>
              <Button sm variant="ghost" onClick={() => setTicket(a)}>Adisyon Aç</Button>
            </div>
          )) : <p className="muted small">Tüm adisyonlar kapatıldı.</p>}
        </Panel>

        {/* Arşiv */}
        <Panel title="Kapatılan Adisyonlar (arşiv)" action={<Chip kind="gold">{sales.length}</Chip>}>
          {sales.length ? sales.map((s) => (
            <div key={s.id} className="list-row">
              <div className="grow">
                <div style={{ fontWeight: 600, color: 'var(--forest-ink)' }}>#{s.no} · {s.service}</div>
                <div className="muted small">{s.guest} · {s.therapist} · Prim {fmtUSD(s.commissionUsd)}</div>
              </div>
              <Badge kind={s.payType === 'folio' ? 'free' : 'sage'}>{PAY.find((p) => p.id === s.payType)?.label}</Badge>
              <div className="money">{fmtTRY(s.amount)}</div>
            </div>
          )) : (
            <div className="empty"><Icon.pos /><div>Henüz adisyon kapatılmadı.<br />Soldan bir adisyon açıp ödemeyi tamamlayın.</div></div>
          )}
        </Panel>
      </div>

      {ticket && <Adisyon appt={ticket} store={store} onClose={() => setTicket(null)} />}
    </div>
  )
}

function Adisyon({ appt, store, onClose }) {
  const { therapists, services, fmtTRY, fmtUSD, commissionFor, closeTicket } = store
  const service = services.find((s) => s.id === appt.serviceId)
  const isFree = !!appt.freeHammam
  const isUndecided = !!appt.undecided

  const [therapistId, setTherapistId] = useState(appt.therapistId || therapists[0].id)
  const [pay, setPay] = useState(null)
  const [hideAfter, setHideAfter] = useState(false)
  // Girişte karar verilen randevu için hizmet seçimi
  const sellable = services.filter((s) => !s.free && !s.undecided)
  const [pickId, setPickId] = useState('')
  const [variant, setVariant] = useState('solo')

  const chosen = services.find((s) => s.id === pickId)
  const chosenIsPackage = chosen?.hasPackage && variant === 'package'

  // Etkin değerler
  let amount, effType, serviceName
  if (isUndecided) {
    amount = chosen ? (chosen.hasPackage ? (chosenIsPackage ? chosen.pkgPrice : chosen.price) : chosen.price) : 0
    effType = chosen ? (chosen.hasPackage ? (chosenIsPackage ? 'package' : 'massage') : chosen.commissionType) : 'none'
    serviceName = chosen ? (chosen.name + (chosenIsPackage ? ' · Paket' : '')) : 'Girişte Belirlenecek'
  } else {
    amount = appt.price
    effType = appt.commissionType ?? service?.commissionType ?? 'massage'
    serviceName = appt.service + (appt.variant === 'package' ? ' · Paket' : '')
  }
  const commissionUsd = isFree || effType === 'none' ? 0 : commissionFor(effType)
  const therapist = therapists.find((t) => t.id === therapistId)
  const changed = !isFree && appt.therapistId && appt.therapistId !== therapistId

  const canFinish = !!pay && (!isUndecided || !!chosen)

  const finish = () => {
    closeTicket(appt, {
      therapistId, payType: pay, hideAfter,
      override: isUndecided ? { serviceName, price: amount, commissionType: effType } : undefined,
    })
    onClose()
  }

  return (
    <Modal title={`Adisyon #${appt.id.toUpperCase().slice(0, 6)}`} sub={`Misafir: ${appt.guest} · ${appt.room}`} onClose={onClose} wide
      footer={<>
        <label className="center gap-sm small muted" style={{ marginRight: 'auto', cursor: 'pointer' }}>
          <input type="checkbox" checked={hideAfter} onChange={(e) => setHideAfter(e.target.checked)} />
          Ödemeden sonra takvimden gizle
        </label>
        <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
        <Button icon="check" disabled={!canFinish} onClick={finish}>Ödemeyi Tamamla</Button>
      </>}>

      {/* Girişte karar verilen randevu: gerçek hizmeti şimdi seç */}
      {isUndecided && (
        <div style={{ marginBottom: 18 }}>
          <Helper>Karar bekleyen randevu — misafir geldi. Uygulanan gerçek hizmeti seçin; fiyat ve prim buna göre hesaplanır.</Helper>
          <div className="grid g-2" style={{ gap: 12, marginTop: 12 }}>
            <div className="field">
              <label>Uygulanan hizmet</label>
              <select className="select" value={pickId} onChange={(e) => { setPickId(e.target.value); setVariant('solo') }}>
                <option value="">Seçiniz…</option>
                {sellable.map((s) => <option key={s.id} value={s.id}>{s.name} — {fmtTRY(s.price)}</option>)}
              </select>
            </div>
            {chosen?.hasPackage && (
              <div className="field">
                <label>Satış türü</label>
                <div className="seg" style={{ width: '100%' }}>
                  <button className={variant === 'solo' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setVariant('solo')}>Sadece · {fmtTRY(chosen.price)}</button>
                  <button className={variant === 'package' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setVariant('package')}>Paket · {fmtTRY(chosen.pkgPrice)}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adisyon tablosu */}
      <table className="table dark-head" style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
        <thead><tr><th>İşlem</th><th>Terapist</th><th className="num">Tutar</th><th className="num">Prim</th></tr></thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600 }}>{serviceName} {isFree && <Badge kind="free">ÜCRETSİZ</Badge>}</td>
            <td>{isFree ? '—' : therapist?.name}</td>
            <td className="num money">{isUndecided && !chosen ? '—' : fmtTRY(amount)}</td>
            <td className="num money" style={{ color: commissionUsd ? 'var(--gold-deep)' : 'var(--muted)' }}>{commissionUsd ? fmtUSD(commissionUsd) : '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* Terapist seçimi — prim ödeme anındaki terapiste yazılır */}
      {!isFree && (
        <div style={{ marginTop: 18 }}>
          <label className="small" style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Primi alacak terapist (ödeme anında)</label>
          <div className="pick-grid" style={{ marginTop: 8 }}>
            {therapists.map((t) => (
              <button key={t.id} className={`pick ${therapistId === t.id ? 'on' : ''}`} onClick={() => setTherapistId(t.id)}>
                <div className="p-t">{t.name}</div>
                <div className="p-s">{t.id === appt.therapistId ? 'Randevudaki terapist' : 'Son dakika değişimi'}</div>
              </button>
            ))}
          </div>
          {changed && <div style={{ marginTop: 12 }}><Helper>Son dakika terapist değişti: prim <b>{therapist?.name}</b>’e yazılacak, randevudaki isme değil.</Helper></div>}
        </div>
      )}
      {isFree && <div style={{ marginTop: 16 }}><Helper>Ücretsiz hamam kullanımı: terapist ve prim yok, tutar ₺0. Kayıt yine de arşivde kalır.</Helper></div>}

      {/* Ödeme tipi */}
      <div style={{ marginTop: 20 }}>
        <label className="small" style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Ödeme Tipi</label>
        <div className="center gap-sm wrap" style={{ marginTop: 8 }}>
          {PAY.map((p) => {
            const I = Icon[p.icon]
            return (
              <button key={p.id} className={`btn ${pay === p.id ? (p.variant === 'gold' ? 'btn-gold' : 'btn-primary') : 'btn-ghost'}`} onClick={() => setPay(p.id)}>
                <I /> {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toplam */}
      <div className="between" style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
        <span className="muted">Toplam</span>
        <span className="display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--forest)' }}>{isUndecided && !chosen ? '—' : fmtTRY(amount)}</span>
      </div>

      <div style={{ marginTop: 14 }}>
        <Helper><b>Önemli:</b> Takvimden silinse bile finans, adisyon ve prim kayıtları silinmez — arşivde kalır.</Helper>
      </div>
    </Modal>
  )
}
