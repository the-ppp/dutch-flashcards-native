import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
import { getReactNativePersistence, initializeAuth } from 'firebase/auth'

// Values come from the Firebase console: Project settings -> General -> "Your apps" -> SDK setup.
// They ship inside the app bundle either way — Metro inlines EXPO_PUBLIC_* at build time — so this
// is not a secrecy measure. It keeps the project's keys out of version control, which is what
// GitHub secret scanning flags. Real protection comes from Firebase Auth/Security Rules plus API
// key restrictions in the Google Cloud console.
//
// Local dev reads .env (gitignored); EAS builds read the same names from EAS environment variables.
// See .env.example for the full list.
//
// Each var must be a static `process.env.NAME` lookup — Metro only inlines dot notation, never
// destructuring or bracket access.
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill in the Firebase console values.`
    )
  }
  return value
}

const firebaseConfig = {
  apiKey: required('EXPO_PUBLIC_FIREBASE_API_KEY', process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: required('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: required('EXPO_PUBLIC_FIREBASE_PROJECT_ID', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: required('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: required('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: required('EXPO_PUBLIC_FIREBASE_APP_ID', process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
}

export const firebaseApp = initializeApp(firebaseConfig)

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
})
