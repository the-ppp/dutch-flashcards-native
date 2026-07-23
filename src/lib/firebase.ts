import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
import { getReactNativePersistence, initializeAuth } from 'firebase/auth'

// Values come from the Firebase console: Project settings -> General -> "Your apps" -> SDK setup.
// Safe to keep client-side; access is governed by Firebase Auth/Security Rules, not by hiding this config.
const firebaseConfig = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY_REMOVED_FROM_HISTORY',
  authDomain: 'easy-language-cards.firebaseapp.com',
  projectId: 'easy-language-cards',
  storageBucket: 'easy-language-cards.firebasestorage.app',
  messagingSenderId: '1097021594922',
  appId: '1:1097021594922:web:f82168fbd9bd2282fbd253',
}

export const firebaseApp = initializeApp(firebaseConfig)

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
})
