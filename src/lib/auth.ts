import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin'
import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebase'
import { trackLogin, trackSignUp } from './analytics'

// From Firebase console: Authentication -> Sign-in method -> Google -> Web SDK configuration (web),
// and GoogleService-Info.plist CLIENT_ID (iOS).
const GOOGLE_WEB_CLIENT_ID = '1097021594922-3crrbfhrknsuejh611q74er6v48mhff5.apps.googleusercontent.com'
const GOOGLE_IOS_CLIENT_ID = '1097021594922-r8kgli5tqcj9btmptd3csacljsfmcu20.apps.googleusercontent.com'

let googleConfigured = false

export async function signInWithGoogle() {
  if (!googleConfigured) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    })
    googleConfigured = true
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }).catch(() => undefined)
  const response = await GoogleSignin.signIn()
  if (!isSuccessResponse(response)) return null

  const idToken = response.data.idToken
  if (!idToken) throw new Error('Google sign-in did not return an ID token')

  const credential = GoogleAuthProvider.credential(idToken)
  const result = await signInWithCredential(auth, credential)
  trackLogin('google')
  return result
}

export async function signInWithApple() {
  const rawNonce = Crypto.randomUUID()
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce)

  let appleCredential: AppleAuthentication.AppleAuthenticationCredential
  try {
    appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashedNonce,
    })
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') return null
    throw error
  }

  if (!appleCredential.identityToken) throw new Error('Apple sign-in did not return an identity token')

  const provider = new OAuthProvider('apple.com')
  const credential = provider.credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  })
  const result = await signInWithCredential(auth, credential)
  trackLogin('apple')
  return result
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  trackLogin('password')
  return result
}

export async function signUpWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  trackSignUp('password')
  return result
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email)
}

export function signOut() {
  return firebaseSignOut(auth)
}

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account already exists with that email.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
}

export function formatAuthError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : ''
  return ERROR_MESSAGES[code] ?? (code ? `Something went wrong (${code}).` : 'Something went wrong. Please try again.')
}
