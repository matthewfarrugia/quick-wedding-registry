
import { initializeApp } from 'firebase/app'
import { initializeAnalytics, type Analytics, logEvent as firebaseLogEvent } from 'firebase/analytics'
import { signInAnonymously, getAuth } from 'firebase/auth'

let app: ReturnType<typeof initializeApp> | null = null
let analytics: Analytics | null = null
let auth: ReturnType<typeof getAuth> | null = null
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
  analytics = initializeAnalytics(app, { config: { debug_mode: import.meta.env.DEV } })
  auth = getAuth(app)
}

function setup() {
  if (!auth) return
  signInAnonymously(auth)
}

function logEvent(eventName: string, eventParams: Record<string, any> = {}) {
  if (!analytics) return 
  firebaseLogEvent(analytics, eventName, eventParams)
}

export { setup, logEvent }