import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, login as loginRequest, registerUser } from '../api'
import type { AuthUser } from '../api'

const TOKEN_STORAGE_KEY = 'auth_token'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
  completeOnboarding: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY) ? 'loading' : 'unauthenticated',
  )

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!storedToken) {
      return
    }

    let cancelled = false

    getCurrentUser(storedToken)
      .then((currentUser) => {
        if (cancelled) return
        setUser(currentUser)
        setToken(storedToken)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token: accessToken } = await loginRequest(email, password)
    const currentUser = await getCurrentUser(accessToken)
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
    setUser(currentUser)
    setToken(accessToken)
    setStatus('authenticated')
  }, [])

  const signup = useCallback(
    async (email: string, password: string) => {
      await registerUser(email, password)
      await login(email, password)
    },
    [login],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
    setToken(null)
    setStatus('unauthenticated')
  }, [])

  const completeOnboarding = useCallback(() => {
    setUser((prev) => (prev ? { ...prev, onboarded: true } : prev))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, token, login, signup, logout, completeOnboarding }),
    [user, status, token, login, signup, logout, completeOnboarding],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
