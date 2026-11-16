import { useMemo, useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Stat, Badge, Chip } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'
import { monthKeyOf, monthLabel, listMonths } from '../lib/period.js'

export default function MyCommissions() {
  const { user, commissions, COMMISSION_RULES, fmtUSD } = useStore()
  const label = (t) => COMMISSION_RULES.find((r) => r.id === t)?.label || t

  // Yalnızca giriş yapan terapistin primleri
  const myAll = useMemo(
    () => commissions.filter((c) => c.therapistId === user?.therapistId),
    [commissions, user?.therapistId],
  )

  // Ay seçici — rakamlar yalnızca seçili ayı kapsar (varsayılan: içinde bulunulan ay)
  const months = useMemo(() => listMonths(myAll), [myAll])
  const [selMonth, setSelMonth] = useState(() => monthKeyOf())
  const curMonth = months.includes(selMonth) ? selMonth : (months[0] || monthKeyOf())

  const mine = useMemo(
    () => myAll.filter((c) => monthKeyOf(c.date) === curMonth)
      .sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [myAll, curMonth],
  )
  const total = mine.reduce((s, c) => s + (Number(c.usd) || 0), 0)
  const paid = mine.filter((c) => c.paid).reduce((s, c) => s + (Number(c.usd) || 0), 0)
  const pending = total - paid

  const monthPicker = (
    <select className="select" value={curMonth} onChange={(e) => setSelMonth(e.target.value)} style={{ maxWidth: 200 }}>
      {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
    </select>
  )

  return (
    <div className="page">
      <PageHead title="Primlerim" sub={`${user?.name} — kapatılan işlemlerden kazandığınız primler (${monthLabel(curMonth)}).`} action={monthPicker} />

      <div className="grid g-3">
        <Stat label={`Toplam prim · ${monthLabel(curMonth)}`} value={fmtUSD(total)} icon="finance" />
        <Stat label="Bekleyen" value={fmtUSD(pending)} icon="clock" />
        <Stat label="İşlem sayısı" value={mine.length} icon="therapist" />
      </div>

      <Panel className="section-gap" title={`Prim Detayı · ${monthLabel(curMonth)}`} action={<Chip kind="gold">{mine.length} kayıt</Chip>}>
        {mine.length ? (
          <table className="table">
            <thead><tr><th>İşlem tipi</th><th>Tarih</th><th className="num">Prim (USD)</th><th>Durum</th></tr></thead>
            <tbody>
              {mine.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{label(c.type)}</td>
                  <td className="muted">{c.date}</td>
                  <td className="num money" style={{ color: 'var(--gold-deep)' }}>{fmtUSD(c.usd)}</td>
                  <td><Badge kind={c.paid ? 'sage' : 'free'}>{c.paid ? 'Ödendi' : 'Bekliyor'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><Icon.finance /><div>{monthLabel(curMonth)} ayında prim kaydınız yok.<br />Adisyonlarınız kapatıldıkça primleriniz burada görünür.</div></div>
        )}
      </Panel>

      <div className="section-gap">
        <div className="helper"><Icon.info /><div>Rakamlar yalnızca seçili ayı ({monthLabel(curMonth)}) kapsar. Primler, adisyon kapanırken ödeme anında seçilen terapiste yazılır.</div></div>
      </div>
    </div>
  )
}
