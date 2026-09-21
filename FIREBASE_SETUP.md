# OscarSpa — Firebase Kurulumu (Ortak Canlı Veri)

Bu adımlar bir defa yapılır. Sonrasında tüm cihazlar aynı canlı veriyi görür,
veriler kalıcı olur ve giriş gerçek/güvenli hale gelir.

## 1) Firebase projesi oluştur
1. https://console.firebase.google.com → Google hesabınla gir.
2. **Add project / Proje ekle** → isim: `oscar-spa` → devam.
3. Google Analytics'i **kapatabilirsin** (gerekmez) → **Create project**.

## 2) Firestore veritabanını aç
1. Sol menü → **Build → Firestore Database** → **Create database**.
2. **Production mode** seç (kuralları biz vereceğiz) → **Next**.
3. Konum: **eur3 (europe-west)** → **Enable**.

## 3) Girişi (Authentication) aç
1. Sol menü → **Build → Authentication** → **Get started**.
2. **Sign-in method** sekmesi → **Email/Password** → **Enable** → **Save**.

## 4) Web uygulaması ekle ve ayarları al
1. ⚙ (üstte) → **Project settings**.
2. Aşağıda **Your apps** → Web simgesi **`</>`** → takma ad `oscar-spa-web` → **Register app**.
3. Ekranda çıkan **firebaseConfig** bloğunu kopyala (apiKey, authDomain, projectId, …).

## 5) Ayarları projeye gir
`src/lib/firebaseConfig.js` içindeki `firebaseConfig` alanlarını doldur.
(API anahtarı client içindir, gizli değildir; herkese açık repoda durabilir.)

## 6) Güvenlik kurallarını yükle
Firestore → **Rules** sekmesine `firestore.rules` içeriğini yapıştır → **Publish**.

## 7) Personel hesaplarını oluştur (bir defa)
```
node scripts/seed.mjs
```
Bu; cigdem / dita / sitti hesaplarını Authentication'a ekler.
(Alternatif: Authentication → Users → Add user ile e-posta `kullanıcıadı@oscarspa.app`
ve şifreleriyle elle de eklenebilir.)

Bitti — uygulama artık "ortak canlı veri" modunda çalışır. 🎉
