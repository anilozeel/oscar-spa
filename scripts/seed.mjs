// ---------------------------------------------------------------------------
// OscarSpa — İlk kurulum tohumlama (bir defa çalıştırılır)
// ---------------------------------------------------------------------------
// Firebase Authentication'da personel hesaplarını (cigdem, dita, sitti) oluşturur.
// Firestore verileri (randevu/misafir/satış/prim/paket) kullanıldıkça boştan dolar,
// tohumlama gerektirmez.
//
// Çalıştırmadan önce: src/lib/firebaseConfig.js doldurulmuş ve
// Firebase Console'da Authentication > Email/Password AÇIK olmalı.
//
// Çalıştırma:  node scripts/seed.mjs
// ---------------------------------------------------------------------------
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { firebaseConfig, AUTH_EMAIL_SUFFIX } from '../src/lib/firebaseConfig.js'
import { ACCOUNTS } from '../src/data/mock.js'

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('HATA: src/lib/firebaseConfig.js boş. Önce Firebase ayarlarını gir.')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

let created = 0
for (const a of ACCOUNTS) {
  const email = a.username.toLowerCase() + AUTH_EMAIL_SUFFIX
  try {
    await createUserWithEmailAndPassword(auth, email, a.password)
    console.log('✓ oluşturuldu:', email)
    created++
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') console.log('• zaten var  :', email)
    else console.error('✗ hata       :', email, e.code || e.message)
  }
}
console.log(`\nBitti. ${created} yeni hesap oluşturuldu. Toplam personel: ${ACCOUNTS.length}.`)
process.exit(0)
