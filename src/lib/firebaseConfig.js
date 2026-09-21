// ---------------------------------------------------------------------------
// Firebase proje ayarları
// ---------------------------------------------------------------------------
// Bu değerleri Firebase Console'dan alacaksın:
//   Project Settings (⚙) > "Your apps" > Web app (</>) > firebaseConfig
//
// NOT: Bu değerler tarayıcı (client) içindir; GİZLİ DEĞİLDİR ve herkese açık
// repoda durabilir. Güvenlik, Firestore güvenlik kuralları + Authentication ile
// sağlanır. Değerler boş kaldığı sürece uygulama "yerel mod"da çalışır
// (veriler yalnızca o cihazda tutulur, cihazlar arası paylaşım olmaz).
// ---------------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

// Girişte kullanıcı adını e-postaya çeviren sabit alan adı (Firebase Auth
// e-posta ister; kullanıcı yine sadece "dita" yazıp girer).
export const AUTH_EMAIL_SUFFIX = '@oscarspa.app'
