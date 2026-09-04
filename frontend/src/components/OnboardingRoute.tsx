import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context'

export function OnboardingRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return null
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  if (user?.onboarded) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
