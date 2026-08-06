import { useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signedOut'; user: null }
  | { status: 'signedIn'; user: User }

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setState(user ? { status: 'signedIn', user } : { status: 'signedOut', user: null })
    })
  }, [])

  return state
}
