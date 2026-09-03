import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignupPage } from './Signup'
import { ApiError } from '../api'
import { useAuth } from '../context'

vi.mock('../context', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const signupMock = vi.fn()

function renderSignupPage() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  signupMock.mockReset()
  mockedUseAuth.mockReturnValue({
    user: null,
    status: 'unauthenticated',
    login: vi.fn(),
    signup: signupMock,
    logout: vi.fn(),
  })
})

describe('SignupPage', () => {
  it('blocks submission and shows validation errors on invalid input', async () => {
    const user = userEvent.setup()
    renderSignupPage()

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/password/i), 'short')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument()
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(signupMock).not.toHaveBeenCalled()
  })

  it('signs up and navigates to the dashboard on success', async () => {
    signupMock.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderSignupPage()

    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
    expect(signupMock).toHaveBeenCalledWith('new@example.com', 'password123')
  })

  it('shows an inline error when the email is already registered', async () => {
    signupMock.mockRejectedValueOnce(new ApiError(400, 'Email already registered'))
    const user = userEvent.setup()
    renderSignupPage()

    await user.type(screen.getByLabelText(/email/i), 'taken@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/already registered/i)).toBeInTheDocument()
  })
})
