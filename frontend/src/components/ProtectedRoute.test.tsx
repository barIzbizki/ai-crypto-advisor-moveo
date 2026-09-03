import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import type { RedirectLocationState } from './ProtectedRoute'
import { useAuth } from '../context'

vi.mock('../context', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

function LocationStateProbe() {
  const location = useLocation()
  const state = location.state as RedirectLocationState | null
  return <div data-testid="from">{state?.from?.pathname ?? ''}</div>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LocationStateProbe />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated visitor to /login', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      status: 'unauthenticated',
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderAt('/dashboard')

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByTestId('from')).toHaveTextContent('/dashboard')
  })

  it('renders the protected content for an authenticated person', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@example.com', created_at: '2026-01-01T00:00:00Z' },
      status: 'authenticated',
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderAt('/dashboard')

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders nothing while auth status is still loading', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      status: 'loading',
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    const { container } = renderAt('/dashboard')

    expect(container).toBeEmptyDOMElement()
  })
})
