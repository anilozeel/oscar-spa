import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Stat, Badge, Chip } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

export default function MyCommissions() {
  const { user, commissions, COMMISSION_RULES, fmtUSD } = useStore()
  const mine = commissions.filter((c) => c.therapistId === user?.therapistId)
  const total = mine.reduce((s, c) => s + c.usd, 0)
  const paid = mine.filter((c) => c.paid).reduce((s, c) => s + c.usd, 0)
  const pending = total - paid
  const label = (t) => COMMISSION_RULES.find((r) => r.id === t)?.label || t

  return (
    <div className="page">
      <PageHead title="Primlerim" sub={`${user?.name} — kapatılan işlemlerden kazandığınız primler.`} />

      <div className="grid g-3">
        <Stat label="Toplam prim" value={fmtUSD(total)} icon="finance" />
        <Stat label="Bekleyen" value={fmtUSD(pending)} icon="clock" />
        <Stat label="İşlem sayısı" value={mine.length} icon="therapist" />
      </div>

      <Panel className="section-gap" title="Prim Detayı" action={<Chip kind="gold">{mine.length} kayıt</Chip>}>
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
          <div className="empty"><Icon.finance /><div>Henüz prim kaydınız yok.<br />Adisyonlarınız kapatıldıkça primleriniz burada görünür.</div></div>
        )}
      </Panel>

      <div className="section-gap">
        <div className="helper"><Icon.info /><div>Primler, adisyon kapanırken ödeme anında seçilen terapiste yazılır. Ay sonu toplamınız buradan takip edilir.</div></div>
      </div>
    </div>
  )
}
