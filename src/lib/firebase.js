// ---------------------------------------------------------------------------
// Firebase başlatma — ayarlar boşsa uygulama "yerel mod"da çalışmaya devam eder
// ---------------------------------------------------------------------------
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { firebaseConfig } from './firebaseConfig.js'

// apiKey + projectId doluysa Firebase (ortak canlı veri) devrededir.
export const FIREBASE_ENABLED = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app = null
let db = null
let auth = null

if (FIREBASE_ENABLED) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
  // eslint-disable-next-line no-console
  console.info('[OscarSpa] Firebase bağlı — ortak canlı veri modu aktif.')
} else {
  // eslint-disable-next-line no-console
  console.info('[OscarSpa] Firebase ayarları yok — yerel mod (veriler cihazda).')
}

export { app, db, auth }
