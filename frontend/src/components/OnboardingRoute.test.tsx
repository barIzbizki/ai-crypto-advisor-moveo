import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { OnboardingRoute } from './OnboardingRoute'
import { useAuth } from '../context'

vi.mock('../context', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <div>Onboarding Content</div>
            </OnboardingRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OnboardingRoute', () => {
  it('redirects an unauthenticated visitor to /login', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      status: 'unauthenticated',
      token: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    renderAt('/onboarding')

    expect(screen.queryByText('Onboarding Content')).not.toBeInTheDocument()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders onboarding content for an authenticated, non-onboarded person', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@example.com', onboarded: false, created_at: '2026-01-01T00:00:00Z' },
      status: 'authenticated',
      token: 'token',
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    renderAt('/onboarding')

    expect(screen.getByText('Onboarding Content')).toBeInTheDocument()
  })

  it('redirects an already-onboarded person to /dashboard', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@example.com', onboarded: true, created_at: '2026-01-01T00:00:00Z' },
      status: 'authenticated',
      token: 'token',
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    renderAt('/onboarding')

    expect(screen.queryByText('Onboarding Content')).not.toBeInTheDocument()
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('renders nothing while auth status is still loading', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      status: 'loading',
      token: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    const { container } = renderAt('/onboarding')

    expect(container).toBeEmptyDOMElement()
  })
})
