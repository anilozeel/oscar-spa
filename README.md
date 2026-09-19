# OscarSpa — Otel Spa & Wellness Yönetim Yazılımı

> Spa operasyonunu, satışı ve misafir deneyimini **tek panelden** yöneten premium web uygulaması.
> Bu depo, konsept sunumundaki görsel tasarımı birebir uygulayan **MVP** sürümüdür.

Tasarım dili: *soft beige / warm white / muted sage green / light gold*, yuvarlatılmış kartlar, premium spa estetiği.

---

## Hızlı Başlangıç (localhost)

Gereksinim: **Node.js 18+** (önerilen 20/22).

```bash
cd oscar-spa
npm install       # bağımlılıkları kurar (ilk seferde)
npm run dev       # geliştirme sunucusunu başlatır
```

Ardından tarayıcıda açın: **http://localhost:5173**

Giriş ekranında herhangi bir **rol** seçip “Panele giriş yap” ile devam edebilirsiniz (demo giriş).

### Üretim derlemesi (opsiyonel)
```bash
npm run build     # dist/ klasörüne derler
npm run preview   # derlenmiş sürümü yerelde önizler
```

---

## Ekranlar (MVP)

| # | Ekran | Açıklama |
|---|-------|----------|
| 1 | **Giriş / Auth** | Rol bazlı giriş (Owner, Spa Manager, Resepsiyon, Terapist, Muhasebe) |
| 2 | **Dashboard** | Günlük ciro, doluluk, randevu, misafir KPI’ları; bugünkü randevular; spa floor özeti |
| 3 | **Randevu Takvimi** | Zaman çizelgesi + 5 adımlı yeni randevu akışı, terapist/oda çakışma engeli |
| 4 | **Spa Floor** | Oda / kabin / hamam durum kartları (Müsait, Dolu, Yaklaşıyor, Temizlik, Bakım) — manuel durum değişimi |
| 5 | **Misafir CRM** | Profil, geçmiş işlemler, tercihler, notlar, deneyim otomasyonları |
| 6 | **Terapistler** | Dita & Sitti; prim kuralları; ödeme sonrası prim mantığı; performans |
| 7 | **Hizmetler** | Spa menüsü; süre, fiyat, oda tipi, prim tipi; *Ücretsiz Hamam Kullanımı* özel tipi |
| 8 | **Paket & Üyelik** | Seans paketleri, kalan kullanım, son kullanma tarihi |
| 9 | **Satış & POS** | Adisyon, terapist seçimi, ödeme tipi (Nakit / Kart / Odaya Yaz), prim yazımı |
| 10 | **Stok** | Ürün kartları, kritik seviye uyarıları, stok değeri |
| 11 | **Finans** | Gelir / gider / komisyon / net, günlük tahsilat |
| 12 | **Raporlama** | KPI’lar, terapist performansı, hazır raporlar, AI önerileri |
| 13 | **Ayarlar** | Kullanıcılar & roller, para birimi/vergi, entegrasyonlar (PMS, WhatsApp) |

## Uygulanan iş kuralları

- **Çakışma engeli:** Aynı terapist ve aynı oda, aynı saatte ikinci kez rezerve edilemez (hamam kapasiteye kadar).
- **Prim = ödeme anındaki terapist:** Prim, randevuda yazan kişiye değil; **adisyon kapanırken seçilen gerçek terapiste** yazılır. Son dakika terapist değişirse prim doğru kişiye aktarılır.
- **Varsayılan prim (USD):** Sadece Masaj `$1.00`, Kese Köpük `$0.50`, Paket Satışı `$1.50`.
- **Ücretsiz Hamam Kullanımı:** Terapist seçtirmez, tutar ve prim `₺0`; takvimde “HAMAM • ÜCRETSİZ” görünür; hamam kapasitesini yine de bloke eder.
- **Arşiv:** Randevu takvimden gizlense/silinse bile finans, adisyon ve prim kayıtları arşivde kalır.

## Teknik

- **Frontend:** React 18 + Vite, component tabanlı, responsive.
- **Yönlendirme:** React Router.
- **Durum & iş kuralları:** Tek `StoreProvider` context katmanı (`src/state/store.jsx`).
- **Veri:** `src/data/mock.js` içinde mock veri — ileride REST/GraphQL API’ye taşınmaya hazır servis mantığı.
- **Tasarım sistemi:** `src/styles/index.css` (CSS değişkenleri ile renk/tipografi token’ları). Yazı tipleri: Playfair Display + Poppins (Google Fonts).

## Klasör yapısı

```
oscar-spa/
├─ index.html
├─ vite.config.js
├─ public/leaf.svg
└─ src/
   ├─ main.jsx / App.jsx
   ├─ styles/index.css        # tasarım sistemi
   ├─ data/mock.js            # mock veri katmanı
   ├─ state/store.jsx         # durum + iş kuralları
   ├─ components/             # Sidebar, Topbar, Layout, ui, icons, Logo
   └─ pages/                  # 13 ekran
```

## Yol Haritası (sonraki adımlar)

- WhatsApp hatırlatma & kampanya entegrasyonu
- PMS / folyo entegrasyonu (odaya yazdırma)
- Online rezervasyon (QR / link)
- Gerçek backend API + veritabanı, kimlik doğrulama
- AI önerilerinin canlı verilerle beslenmesi
