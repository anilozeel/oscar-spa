import { useMemo, useState } from 'react'
import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Avatar, Chip, Progress, Badge } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'
import { monthKeyOf, monthLabel, listMonths } from '../lib/period.js'

const RULE_FLOW = [
  { t: 'Randevuda Dita seçili olabilir', on: false },
  { t: 'Misafir son dakika Sitti ister', on: false },
  { t: 'Adisyonda terapist Sitti yapılır', on: false },
  { t: 'Ödeme alınır ve prim Sitti’ye yazar', on: true },
  { t: 'Randevu takvimden kapanır / silinebilir', on: false },
]

export default function Therapists() {
  const { therapists, COMMISSION_RULES, fmtUSD, commissions } = useStore()

  // Ay seçici — primler yalnızca seçili ayı kapsar (varsayılan: içinde bulunulan ay)
  const months = useMemo(() => listMonths(commissions), [commissions])
  const [selMonth, setSelMonth] = useState(() => monthKeyOf())
  const curMonth = months.includes(selMonth) ? selMonth : (months[0] || monthKeyOf())
  const monthCommissions = useMemo(
    () => commissions.filter((c) => monthKeyOf(c.date) === curMonth),
    [commissions, curMonth],
  )

  // Canlı per-terapist istatistik (statik mock yerine gerçek primlerden — seçili ay)
  const stats = useMemo(() => {
    const m = {}
    for (const t of therapists) m[t.id] = { count: 0, usd: 0 }
    for (const c of monthCommissions) {
      if (!m[c.therapistId]) m[c.therapistId] = { count: 0, usd: 0 }
      m[c.therapistId].count++
      m[c.therapistId].usd += Number(c.usd) || 0
    }
    const maxCount = Math.max(1, ...Object.values(m).map((s) => s.count))
    for (const k of Object.keys(m)) m[k].load = Math.round((m[k].count / maxCount) * 100)
    return m
  }, [therapists, monthCommissions])

  const monthPicker = (
    <select className="select" value={curMonth} onChange={(e) => setSelMonth(e.target.value)} style={{ maxWidth: 200 }}>
      {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
    </select>
  )

  return (
    <div className="page">
      <PageHead title="Personel Prim Sistemi" sub="Prim, randevuda yazan kişiye değil; ödeme/adisyon kapanırken seçilen gerçek terapiste yazılmalı." action={monthPicker} />

      <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr 1fr', alignItems: 'start' }}>
        {/* Terapistler */}
        <Panel title="Terapistler">
          {therapists.map((t) => (
            <div key={t.id} className="card" style={{ background: 'var(--surface-2)', marginBottom: 12, padding: 16 }}>
              <div className="center gap">
                <Avatar text={t.initials} />
                <div className="grow">
                  <div className="between">
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--forest-ink)' }}>{t.name}</div>
                    <Badge kind="sage" dot="var(--success)">Aktif</Badge>
                  </div>
                  <div className="muted small" style={{ marginTop: 2 }}>{t.skills.join(' + ')}</div>
                </div>
              </div>
              <div className="between" style={{ marginTop: 14 }}>
                <span className="muted small">{stats[t.id]?.count || 0} işlem · ⭐ {t.rating}</span>
                <span className="money" style={{ color: 'var(--gold-deep)' }}>{fmtUSD(stats[t.id]?.usd || 0)} <span className="muted small">{monthLabel(curMonth)} primi</span></span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="between" style={{ marginBottom: 5 }}><span className="muted small">İş yükü payı</span><span className="small" style={{ fontWeight: 600 }}>%{stats[t.id]?.load || 0}</span></div>
                <Progress value={stats[t.id]?.load || 0} kind={(stats[t.id]?.load || 0) > 80 ? 'gold' : ''} />
              </div>
            </div>
          ))}
          <div className="helper" style={{ marginTop: 6 }}>
            <Icon.info />
            <div>Rakamlar yalnızca seçili ayı ({monthLabel(curMonth)}) kapsar; üstteki aydan başka bir ay seçebilirsiniz.</div>
          </div>
        </Panel>

        {/* Default prim hesabı */}
        <Panel title="Default Prim Hesabı">
          {COMMISSION_RULES.map((r) => (
            <div key={r.id} className="card" style={{ marginBottom: 12, padding: '16px 18px' }}>
              <div className="between">
                <span style={{ fontWeight: 600, fontSize: 15 }}>{r.label}</span>
                <span className="display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--forest)' }}>{fmtUSD(r.usd)}</span>
              </div>
            </div>
          ))}
          <div className="center gap-sm" style={{ marginTop: 6 }}>
            <Chip>USD bazlı</Chip><Chip>Düzenlenebilir</Chip>
          </div>
          <p className="muted small" style={{ marginTop: 14, textAlign: 'center' }}>
            Prim kuralları ileride terapist bazlı değiştirilebilir. İlk kurulumda bu değerler varsayılan olsun.
          </p>
        </Panel>

        {/* Ödeme sonrası kuralı */}
        <Panel title="Ödeme Sonrası Kuralı">
          {RULE_FLOW.map((s, i) => (
            <div key={i} className="center gap" style={{ padding: '9px 0' }}>
              <span className="step-num" style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13, flex: 'none', background: s.on ? 'var(--gold)' : 'var(--sage-soft)', color: s.on ? '#fff' : 'var(--sage-deep)' }}>{i + 1}</span>
              <span style={{ fontWeight: s.on ? 600 : 500, color: s.on ? 'var(--forest-ink)' : 'var(--ink-2)' }}>{s.t}</span>
            </div>
          ))}
          <div className="card" style={{ background: 'var(--surface-2)', marginTop: 14, textAlign: 'center', fontWeight: 600, fontSize: 13, color: 'var(--gold-deep)' }}>
            Prim hesaplama tetikleyicisi: ödeme / adisyon kapatma
          </div>
        </Panel>
      </div>

      {/* Yazılan primler (canlı — seçili ay) */}
      <Panel className="section-gap" title={`Yazılan Primler · ${monthLabel(curMonth)}`} action={<Chip kind="gold">{monthCommissions.length} kayıt</Chip>}>
        {monthCommissions.length ? (
          <table className="table">
            <thead><tr><th>Tarih</th><th>Terapist</th><th>İşlem tipi</th><th className="num">Prim (USD)</th><th>Durum</th></tr></thead>
            <tbody>
              {[...monthCommissions].sort((a, b) => String(b.date).localeCompare(String(a.date))).map((c) => (
                <tr key={c.id}>
                  <td className="nowrap">{c.date || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{c.therapist}</td>
                  <td>{COMMISSION_RULES.find((r) => r.id === c.type)?.label || c.type}</td>
                  <td className="num money">{fmtUSD(c.usd)}</td>
                  <td><Badge kind={c.paid ? 'sage' : 'free'}>{c.paid ? 'Ödendi' : 'Bekliyor'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted small">{monthLabel(curMonth)} ayında prim kaydı yok. Başka bir ay seçebilir veya Satış &amp; POS ekranından adisyon kapattığınızda prim buraya düşer.</p>
        )}
      </Panel>
    </div>
  )
}
