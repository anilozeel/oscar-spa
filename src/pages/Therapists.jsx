import { useStore } from '../state/store.jsx'
import { PageHead, Panel, Avatar, Chip, Progress, Badge } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

const RULE_FLOW = [
  { t: 'Randevuda Dita seçili olabilir', on: false },
  { t: 'Misafir son dakika Sitti ister', on: false },
  { t: 'Adisyonda terapist Sitti yapılır', on: false },
  { t: 'Ödeme alınır ve prim Sitti’ye yazar', on: true },
  { t: 'Randevu takvimden kapanır / silinebilir', on: false },
]

export default function Therapists() {
  const { therapists, COMMISSION_RULES, fmtUSD, fmtTRY, commissions } = useStore()

  return (
    <div className="page">
      <PageHead title="Personel Prim Sistemi" sub="Prim, randevuda yazan kişiye değil; ödeme/adisyon kapanırken seçilen gerçek terapiste yazılmalı." />

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
                <span className="muted small">Bugün {t.todayCount} işlem · ⭐ {t.rating}</span>
                <span className="money" style={{ color: 'var(--gold-deep)' }}>{fmtUSD(t.monthCommissionUsd)} <span className="muted small">/ ay</span></span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="between" style={{ marginBottom: 5 }}><span className="muted small">Doluluk</span><span className="small" style={{ fontWeight: 600 }}>%{t.load}</span></div>
                <Progress value={t.load} kind={t.load > 80 ? 'gold' : ''} />
              </div>
            </div>
          ))}
          <div className="helper" style={{ marginTop: 6 }}>
            <Icon.info />
            <div>Personel kartında hangi işlemden ne prim aldığı görünür; ay sonu toplam prim otomatik çıkar.</div>
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

      {/* Yazılan primler (canlı) */}
      <Panel className="section-gap" title="Yazılan Primler (bugün)" action={<Chip kind="gold">{commissions.length} kayıt</Chip>}>
        {commissions.length ? (
          <table className="table">
            <thead><tr><th>Terapist</th><th>İşlem tipi</th><th className="num">Prim (USD)</th><th>Durum</th></tr></thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.therapist}</td>
                  <td>{COMMISSION_RULES.find((r) => r.id === c.type)?.label || c.type}</td>
                  <td className="num money">{fmtUSD(c.usd)}</td>
                  <td><Badge kind={c.paid ? 'sage' : 'free'}>{c.paid ? 'Ödendi' : 'Bekliyor'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted small">Henüz prim yazılmadı. Satış &amp; POS ekranından bir adisyon kapattığınızda, prim ödeme anında seçilen terapiste burada görünür.</p>
        )}
      </Panel>
    </div>
  )
}
