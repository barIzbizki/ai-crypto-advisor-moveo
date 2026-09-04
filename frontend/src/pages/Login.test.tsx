import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { InitialEntry } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './Login'
import { ApiError } from '../api'
import { useAuth } from '../context'

vi.mock('../context', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const loginMock = vi.fn()

function renderLoginPage(initialEntries: InitialEntry[] = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/settings" element={<div>Settings Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  loginMock.mockReset()
  mockedUseAuth.mockReturnValue({
    user: null,
    status: 'unauthenticated',
    token: null,
    login: loginMock,
    signup: vi.fn(),
    logout: vi.fn(),
    completeOnboarding: vi.fn(),
  })
})

describe('LoginPage', () => {
  it('blocks submission and shows validation errors on invalid input', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('logs in and navigates to the default route on success', async () => {
    loginMock.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'a@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
    expect(loginMock).toHaveBeenCalledWith('a@example.com', 'password123')
  })

  it('navigates back to the originally requested route after login', async () => {
    loginMock.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderLoginPage([{ pathname: '/login', state: { from: { pathname: '/settings' } } }])

    await user.type(screen.getByLabelText(/email/i), 'a@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(screen.getByText('Settings Page')).toBeInTheDocument())
  })

  it('shows a generic error on invalid credentials without saying which field was wrong', async () => {
    loginMock.mockRejectedValueOnce(new ApiError(401, 'Incorrect email or password'))
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'a@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument()
  })
})
