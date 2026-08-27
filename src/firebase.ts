
import { initializeApp } from 'firebase/app'
import { initializeAnalytics, type Analytics, logEvent as firebaseLogEvent } from 'firebase/analytics'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { signInAnonymously, getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc, increment, serverTimestamp, getDoc, type Firestore } from 'firebase/firestore/lite'

let app: ReturnType<typeof initializeApp> | null = null
let analytics: Analytics | null = null
let auth: ReturnType<typeof getAuth> | null = null
let db: Firestore | null = null
if (!!import.meta.env.VITE_FIREBASE_API_KEY) {
  app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  })
  startAnalytics(app).catch((error) => {
    if (import.meta.env.DEV) console.error('Analytics init failed', error)
  })

  if (import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY) {
    if (import.meta.env.DEV) (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    })
  }

  auth = getAuth(app)
  db = getFirestore(app)
}

let signedIn: Promise<unknown> | null = null
function setup() {
  if (!auth) return
  signedIn = signInAnonymously(auth).catch((error) => {
    if (import.meta.env.DEV) console.error('Anonymous sign-in failed', error)
  })
}

function whenOnline() {
  if (navigator.onLine) return Promise.resolve()
  return new Promise<void>((resolve) => window.addEventListener('online', () => resolve(), { once: true }))
}

const queued: { name: string, params: Record<string, any> }[] = []
async function startAnalytics(firebaseApp: ReturnType<typeof initializeApp>) {
  await whenOnline()
  analytics = initializeAnalytics(firebaseApp, { config: { debug_mode: import.meta.env.DEV } })
  for (const { name, params } of queued.splice(0)) firebaseLogEvent(analytics, name, params)
}

function logEvent(eventName: string, eventParams: Record<string, any> = {}) {
  if (!app) return
  if (!analytics) {
    if (queued.length < 50) queued.push({ name: eventName, params: eventParams })
    return
  }
  firebaseLogEvent(analytics, eventName, eventParams)
}

export type Ledger = { total: number, gifts: number, updatedAt: { seconds: number, nanoseconds: number } }

async function readMonzoLedger(account: string) {
  if (!db) throw new Error('Firestore is not initialized')
  const docRef = doc(db, 'totals', account)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return docSnap.data() as Ledger
  } else {
    throw new Error(`No document found for account: ${account}`)
  }
}

async function recordMonzoGift(amount: number, account: string) {
  const write = Promise.resolve(signedIn)
    .then(() => setDoc(
      doc(db!, 'totals', account),
      {
        total: increment(amount),
        gifts: increment(1),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    ))
    .catch((error) => {
      if (import.meta.env.DEV) console.error('Failed to record Monzo gift', error)
    })

  await Promise.race([
    write,
    new Promise((resolve) => setTimeout(resolve, 1500))
  ])
}

export { setup, logEvent, readMonzoLedger, recordMonzoGift }
