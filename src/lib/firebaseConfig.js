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
  apiKey: 'AIzaSyAKcFtOSwyTftvU7wz5HOt5BeCSSIwYBeo',
  authDomain: 'oscar-spa-71823.firebaseapp.com',
  projectId: 'oscar-spa-71823',
  storageBucket: 'oscar-spa-71823.firebasestorage.app',
  messagingSenderId: '261608365338',
  appId: '1:261608365338:web:ec51a723787db92834a0a3',
}

// Girişte kullanıcı adını e-postaya çeviren sabit alan adı (Firebase Auth
// e-posta ister; kullanıcı yine sadece "dita" yazıp girer).
export const AUTH_EMAIL_SUFFIX = '@oscarspa.app'
