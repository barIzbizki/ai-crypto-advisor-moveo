import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context'

export interface RedirectLocationState {
  from?: { pathname: string }
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return null
  }

  if (status !== 'authenticated') {
    const state: RedirectLocationState = { from: { pathname: location.pathname } }
    return <Navigate to="/login" replace state={state} />
  }

  if (user && !user.onboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
