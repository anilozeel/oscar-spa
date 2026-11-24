import { useEffect, useState, useCallback } from 'react'
import { PageHead, Panel, Button, Chip } from '../components/ui.jsx'
import Icon from '../components/icons.jsx'

// Misafir spa menüsü (oscarseasidehotel.com/menu/spa.html) yönetimi.
// Kaynak: restoran backend'i (data.json → spa). Kaydedince spa.html otomatik yansır.
const API = '/menu/api.php'
const getKey = () => { try { return localStorage.getItem('mgrKey') || '' } catch { return '' } }
const emptyItem = () => ({ name: '', price: null, name_en: '', name_ru: '', active: true })
const emptyCat = () => ({ name: '', note: '', name_en: '', name_ru: '', items: [emptyItem()] })

export default function SpaMenu() {
  const [spa, setSpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)   // {t:'ok'|'err', x:''}
  const key = getKey()

  const load = useCallback(() => {
    setLoading(true)
    fetch(API + '?fn=spamenu&t=' + Date.now())
      .then((r) => r.json())
      .then((j) => {
        const s = (j && j.ok && j.spa) ? j.spa : {}
        setSpa({
          title: s.title || 'Spa & Wellness Menü',
          showPrices: s.showPrices !== false,
          note: s.note || '',
          footerLoc: s.footerLoc || '',
          footerTel: s.footerTel || '',
          categories: Array.isArray(s.categories) ? s.categories.map((c) => ({
            name: c.name || '', note: c.note || '', name_en: c.name_en || '', name_ru: c.name_ru || '',
            items: Array.isArray(c.items) ? c.items.map((it) => ({
              name: it.name || '', price: (it.price == null ? null : it.price),
              name_en: it.name_en || '', name_ru: it.name_ru || '', active: it.active !== false,
            })) : [],
          })) : [],
        })
        setLoading(false)
      })
      .catch(() => { setMsg({ t: 'err', x: 'Menü yüklenemedi.' }); setLoading(false) })
  }, [])
  useEffect(() => { load() }, [load])

  const patch = (fn) => setSpa((s) => { const n = structuredClone(s); fn(n); return n })
  const setCat = (ci, k, v) => patch((n) => { n.categories[ci][k] = v })
  const setItem = (ci, ii, k, v) => patch((n) => { n.categories[ci].items[ii][k] = v })
  const addItem = (ci) => patch((n) => n.categories[ci].items.push(emptyItem()))
  const delItem = (ci, ii) => patch((n) => n.categories[ci].items.splice(ii, 1))
  const addCat = () => patch((n) => n.categories.push(emptyCat()))
  const delCat = (ci) => patch((n) => n.categories.splice(ci, 1))
  const moveCat = (ci, d) => patch((n) => { const j = ci + d; if (j < 0 || j >= n.categories.length) return; const [c] = n.categories.splice(ci, 1); n.categories.splice(j, 0, c) })

  const save = () => {
    if (!key) { setMsg({ t: 'err', x: 'Kaydetmek için otelotomasyon paneli üzerinden açın (yönetici anahtarı gerekli).' }); return }
    setSaving(true); setMsg(null)
    const clean = {
      title: (spa.title || '').trim() || 'Spa & Wellness Menü',
      showPrices: !!spa.showPrices,
      note: (spa.note || '').trim(),
      footerLoc: (spa.footerLoc || '').trim(),
      footerTel: (spa.footerTel || '').trim(),
      categories: spa.categories
        .map((c) => ({
          name: (c.name || '').trim(), note: (c.note || '').trim(),
          name_en: (c.name_en || '').trim(), name_ru: (c.name_ru || '').trim(),
          items: c.items
            .filter((it) => (it.name || '').trim() !== '')
            .map((it) => ({
              name: (it.name || '').trim(),
              price: (it.price === '' || it.price == null) ? null : Number(it.price),
              name_en: (it.name_en || '').trim(), name_ru: (it.name_ru || '').trim(),
              active: it.active !== false,
            })),
        }))
        .filter((c) => c.name !== '' && c.items.length),
    }
    fetch(API + '?fn=setspamenu', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Staff-Key': key }, body: JSON.stringify({ spa: clean }) })
      .then((r) => r.json())
      .then((j) => { setSaving(false); if (j && j.ok) setMsg({ t: 'ok', x: 'Kaydedildi — misafir spa menüsü (spa.html) güncellendi.' }); else setMsg({ t: 'err', x: 'Kaydedilemedi: ' + ((j && j.error) || 'yetki hatası') }) })
      .catch(() => { setSaving(false); setMsg({ t: 'err', x: 'Bağlantı hatası.' }) })
  }

  const inp = { width: '100%', padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 9, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)' }

  if (loading || !spa) {
    return (<div className="page"><PageHead title="Spa Menü" sub="Misafirlerin gördüğü spa menüsü (spa.html)." /><Panel><div className="muted" style={{ padding: 20 }}>Yükleniyor…</div></Panel></div>)
  }

  return (
    <div className="page">
      <PageHead title="Spa Menü" sub="Misafirlerin QR ile gördüğü spa menüsü. Kaydedince spa.html otomatik güncellenir."
        action={<Button icon="check" onClick={save} disabled={saving}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>} />

      {!key && (
        <Panel className="section-gap"><div style={{ padding: '12px 4px', color: 'var(--gold-deep)', fontWeight: 600, fontSize: 13.5 }}>
          <Icon.info style={{ width: 16, height: 16, verticalAlign: '-3px', marginRight: 6 }} />
          Düzenleyebilirsin ama <b>kaydetmek için</b> bu ekranı otelotomasyon paneli içinden açman gerekir (yönetici anahtarı orada hazır olur).
        </div></Panel>
      )}
      {msg && (
        <div style={{ margin: '0 0 14px', padding: '11px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13.5,
          background: msg.t === 'ok' ? 'var(--sage-soft)' : '#fdecea', color: msg.t === 'ok' ? 'var(--forest)' : '#c0392b' }}>{msg.x}</div>
      )}

      <Panel title="Başlık & Genel" className="section-gap">
        <div className="grid g-2" style={{ gap: 12 }}>
          <label className="field"><span className="muted small">Menü başlığı</span>
            <input style={inp} value={spa.title} onChange={(e) => patch((n) => n.title = e.target.value)} /></label>
          <label className="field"><span className="muted small">Üst not (opsiyonel)</span>
            <input style={inp} value={spa.note} onChange={(e) => patch((n) => n.note = e.target.value)} /></label>
          <label className="field"><span className="muted small">Konum (alt bilgi)</span>
            <input style={inp} value={spa.footerLoc} onChange={(e) => patch((n) => n.footerLoc = e.target.value)} /></label>
          <label className="field"><span className="muted small">Telefon / WhatsApp (alt bilgi)</span>
            <input style={inp} value={spa.footerTel} onChange={(e) => patch((n) => n.footerTel = e.target.value)} /></label>
        </div>
        <label className="center gap-sm small" style={{ cursor: 'pointer', marginTop: 12 }}>
          <input type="checkbox" checked={spa.showPrices} onChange={(e) => patch((n) => n.showPrices = e.target.checked)} /> Fiyatları göster
        </label>
      </Panel>

      {spa.categories.map((c, ci) => (
        <Panel key={ci} className="section-gap"
          title={<span>Kategori {ci + 1}{c.name ? ' · ' + c.name : ''}</span>}
          action={<span className="center gap-sm">
            <Chip>{c.items.length} ürün</Chip>
            <button className="icon-btn" title="Yukarı" onClick={() => moveCat(ci, -1)}>↑</button>
            <button className="icon-btn" title="Aşağı" onClick={() => moveCat(ci, 1)}>↓</button>
            <button className="icon-btn" title="Kategoriyi sil" style={{ color: '#c0392b' }} onClick={() => delCat(ci)}><Icon.trash style={{ width: 16, height: 16 }} /></button>
          </span>}>
          <div className="grid g-2" style={{ gap: 12, marginBottom: 6 }}>
            <label className="field"><span className="muted small">Kategori adı (TR)</span>
              <input style={inp} value={c.name} onChange={(e) => setCat(ci, 'name', e.target.value)} placeholder="Örn. Paketler / Sadece Masaj" /></label>
            <label className="field"><span className="muted small">Kategori notu (opsiyonel)</span>
              <input style={inp} value={c.note} onChange={(e) => setCat(ci, 'note', e.target.value)} /></label>
            <label className="field"><span className="muted small">Ad (EN)</span>
              <input style={inp} value={c.name_en} onChange={(e) => setCat(ci, 'name_en', e.target.value)} /></label>
            <label className="field"><span className="muted small">Ad (RU)</span>
              <input style={inp} value={c.name_ru} onChange={(e) => setCat(ci, 'name_ru', e.target.value)} /></label>
          </div>

          <div style={{ marginTop: 8 }}>
            {c.items.map((it, ii) => (
              <div key={ii} style={{ border: '1px solid var(--line)', borderRadius: 11, padding: 10, marginBottom: 9, background: it.active ? 'var(--surface)' : 'var(--surface-2)' }}>
                <div className="center" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <input style={{ ...inp, flex: '2 1 180px', width: 'auto' }} value={it.name} onChange={(e) => setItem(ci, ii, 'name', e.target.value)} placeholder="Ürün adı (TR)" />
                  <input style={{ ...inp, flex: '0 0 110px', width: 110 }} type="number" min="0" step="50" value={it.price == null ? '' : it.price} onChange={(e) => setItem(ci, ii, 'price', e.target.value === '' ? null : e.target.value)} placeholder="Fiyat ₺" />
                  <label className="center gap-sm small" style={{ cursor: 'pointer', flex: 'none' }}>
                    <input type="checkbox" checked={it.active} onChange={(e) => setItem(ci, ii, 'active', e.target.checked)} /> Aktif
                  </label>
                  <button className="icon-btn" title="Ürünü sil" style={{ color: '#c0392b', flex: 'none' }} onClick={() => delItem(ci, ii)}><Icon.trash style={{ width: 16, height: 16 }} /></button>
                </div>
                <div className="center" style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <input style={{ ...inp, flex: '1 1 160px', width: 'auto' }} value={it.name_en} onChange={(e) => setItem(ci, ii, 'name_en', e.target.value)} placeholder="Ad (EN)" />
                  <input style={{ ...inp, flex: '1 1 160px', width: 'auto' }} value={it.name_ru} onChange={(e) => setItem(ci, ii, 'name_ru', e.target.value)} placeholder="Ad (RU)" />
                </div>
              </div>
            ))}
            <Button variant="ghost" icon="plus" onClick={() => addItem(ci)}>Ürün ekle</Button>
          </div>
        </Panel>
      ))}

      <div className="center" style={{ gap: 10, marginTop: 4 }}>
        <Button variant="ghost" icon="plus" onClick={addCat}>Kategori ekle</Button>
        <Button icon="check" onClick={save} disabled={saving}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
      </div>
      <p className="muted small" style={{ marginTop: 14 }}>Not: Bu menü, misafirlerin gördüğü <b>spa.html</b>'i besler; terapist/rezervasyon hizmetlerinden ayrıdır. Kaydedince anında yayınlanır.</p>
    </div>
  )
}
