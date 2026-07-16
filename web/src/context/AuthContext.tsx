/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import api, { setTokenProvider } from '../services/api'
import { auth } from '../services/firebase'
import type { ApiResponse, SyncProfileRequest, UserProfile } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  profile: UserProfile | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
  refreshProfile: () => Promise<void>
  syncProfile: (data: SyncProfileRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function shouldUseRedirectFlow() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null
    try {
      return await getIdToken(auth.currentUser)
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    setTokenProvider(getToken)
  }, [getToken])

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<UserProfile>>('/users/me')
      if (res.data.success && res.data.data) {
        setProfile(res.data.data)
      }
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        void refreshProfile()
      } else {
        setProfile(null)
      }
    })
    return unsubscribe
  }, [refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    if (shouldUseRedirectFlow()) {
      await signInWithRedirect(auth, provider)
      return
    }

    await signInWithPopup(auth, provider)
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setProfile(null)
  }, [])

  const syncProfile = useCallback(async (data: SyncProfileRequest) => {
    const res = await api.post<ApiResponse<UserProfile>>('/users/me', data)
    if (res.data.success && res.data.data) {
      setProfile(res.data.data)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        getToken,
        refreshProfile,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
