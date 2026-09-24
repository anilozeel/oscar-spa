# OscarSpa — Google Play Yayın Rehberi (adım adım)

Bu rehber, uygulamayı **herkese açık** yayınlamak içindir. Metinler `listing-tr.md`'de, görseller bu klasördedir.

## Elindeki dosyalar
- **İmzalı AAB:** GitHub → repo → Releases → **"OscarSpa — Play Store AAB"** → `OscarSpa.aab` (secret'lar eklenince üretilecek)
- **Uygulama simgesi (512×512):** `store-assets/icon-512.png`
- **Özellik görseli (1024×500):** `store-assets/feature-graphic.png`
- **Ekran görüntüleri (telefon):** `store-assets/screenshots/*.png`
- **Gizlilik Politikası:** https://anilozeel.github.io/oscar-spa/privacy.html
- **Metinler:** `store-assets/listing-tr.md`

---

## 1) Uygulamayı oluştur
Play Console → **Uygulama oluştur**
- Ad: **OscarSpa** · Varsayılan dil: **Türkçe** · Tür: **Uygulama** · **Ücretsiz**
- Beyanları işaretle → Oluştur.

## 2) Mağaza girişi (Main store listing)
Sol menü: **Store presence → Main store listing**
- Uygulama adı: `OscarSpa`
- Kısa açıklama + Tam açıklama: `listing-tr.md`'den kopyala
- **Uygulama simgesi:** `icon-512.png`
- **Özellik grafiği:** `feature-graphic.png`
- **Telefon ekran görüntüleri:** `screenshots/` içindekilerin hepsini yükle (en az 2 gerekli)
- Kategori: **İş (Business)** · İletişim e-postası: `info@ticiup.com`

## 3) Uygulama içeriği (App content) — sol menü "Policy → App content"
- **Gizlilik Politikası:** yukarıdaki URL'yi yapıştır.
- **Uygulama erişimi (App access):** "Tüm işlevler kısıtlı" → giriş bilgisi ekle:
  Kullanıcı adı `cigdem`, Şifre `cigdem123` (inceleyici için).
- **Reklamlar (Ads):** Hayır (reklam içermiyor).
- **İçerik derecelendirmesi (Content rating):** Anketi doldur — kategori "Yardımcı Uygulama/İş"; şiddet, cinsellik, kumar vb. sorulara **Hayır**. Sonuç: Herkes (3+).
- **Hedef kitle (Target audience):** 18+ (işletme personeli). Çocuklara yönelik: Hayır.
- **Veri güvenliği (Data safety):** aşağıdaki bölüme göre doldur.

## 4) Veri güvenliği (Data safety) cevapları
- Uygulama veri **topluyor mu?** → **Evet**. Üçüncü taraflarla **paylaşıyor mu?** → **Hayır**.
- Aktarımda **şifreleme** var mı? → **Evet**.
- Kullanıcı **veri silme** talep edebilir mi? → **Evet** (info@ticiup.com).
- Toplanan veri türleri (her biri: Amaç = **Uygulama işlevselliği**, Paylaşım = Hayır):
  - **Ad** (misafir adı)
  - **Telefon numarası** (misafir)
  - **Diğer kullanıcı içeriği** (randevu/işlem/not kayıtları)
  - **Uygulama etkinliği** yok, **Konum** yok, **Kişiler/rehber** yok.
- Personel girişi (kullanıcı adı/şifre) kimlik doğrulama içindir; şifreler güvenli saklanır.

## 5) Sürüm oluştur (Production)
Sol menü: **Production → Yeni sürüm oluştur (Create new release)**
- **Play App Signing:** çıkarsa **kabul et** (Google imza anahtarını yönetir; sen bizim upload anahtarımızla yüklüyorsun — sorun değil).
- **AAB yükle:** GitHub Releases'ten indirdiğin `OscarSpa.aab`'yi sürükle-bırak.
- Sürüm adı: `1.0.0` · Sürüm notu (örnek): "İlk yayın — spa randevu, misafir, satış, prim ve bildirim yönetimi."
- Ülkeler/bölgeler: **Türkiye** (istersen tümü).
- Kaydet → **İncele (Review)** → **Yayına gönder (Rollout to Production)**.

## 6) ⚠️ Yeni kişisel hesap kuralı (varsa)
Hesabın **yeni bir kişisel** hesapsa, Google üretim için önce **kapalı test (20 testçi, 14 gün)** isteyebilir:
- **Test → Kapalı test** kanalı oluştur → aynı AAB'yi yükle → **20 test kullanıcısının e-postasını** ekle → 14 gün açık kalsın → sonra üretim başvurusu.
- Hesabın **işletme (organization)** olarak kayıtlıysa bu kural genelde **uygulanmaz**; doğrudan üretime gidebilirsin.

## 7) İnceleme
Gönderdikten sonra Google incelemesi genelde **birkaç gün** sürer. Onaylanınca uygulama Play'de yayında olur. Reddedilirse sebebini bana ilet, birlikte düzeltiriz.

---

### Sonraki güncellemeler
Kodda değişiklik olduğunda: `android/app/build.gradle` içinde **versionCode**'u artır (1 → 2 …), AAB'yi yeniden üret (GitHub Actions "Build Release AAB"), Play'de **yeni sürüm** olarak yükle.
