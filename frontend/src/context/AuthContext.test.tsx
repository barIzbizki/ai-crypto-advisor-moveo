import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { getCurrentUser, login, registerUser } from '../api'

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>()
  return {
    ...actual,
    registerUser: vi.fn(),
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  }
})

const mockedRegisterUser = vi.mocked(registerUser)
const mockedLogin = vi.mocked(login)
const mockedGetCurrentUser = vi.mocked(getCurrentUser)

const testUser = { id: 1, email: 'a@example.com', name: null, onboarded: false, created_at: '2026-01-01T00:00:00Z' }

function TestConsumer() {
  const { user, status, token, login: doLogin, signup, logout, completeOnboarding } = useAuth()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? ''}</span>
      <span data-testid="token">{token ?? ''}</span>
      <span data-testid="onboarded">{String(user?.onboarded ?? '')}</span>
      <button onClick={() => doLogin('a@example.com', 'password123')}>login</button>
      <button onClick={() => signup('a@example.com', 'password123')}>signup</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => completeOnboarding()}>complete-onboarding</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('AuthContext', () => {
  it('starts unauthenticated when no session is stored', async () => {
    renderWithProvider()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(mockedGetCurrentUser).not.toHaveBeenCalled()
  })

  it('restores a valid stored session on load', async () => {
    localStorage.setItem('auth_token', 'stored-token')
    mockedGetCurrentUser.mockResolvedValueOnce(testUser)

    renderWithProvider()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(screen.getByTestId('email')).toHaveTextContent('a@example.com')
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token')
    expect(screen.getByTestId('onboarded')).toHaveTextContent('false')
    expect(mockedGetCurrentUser).toHaveBeenCalledWith('stored-token')
  })

  it('clears an invalid or expired stored token on load', async () => {
    localStorage.setItem('auth_token', 'bad-token')
    mockedGetCurrentUser.mockRejectedValueOnce(new Error('unauthorized'))

    renderWithProvider()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('login populates and persists the session', async () => {
    mockedLogin.mockResolvedValueOnce({ access_token: 'new-token', token_type: 'bearer' })
    mockedGetCurrentUser.mockResolvedValueOnce(testUser)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))

    await act(async () => {
      screen.getByText('login').click()
    })

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(localStorage.getItem('auth_token')).toBe('new-token')
  })

  it('signup registers the account and then logs in', async () => {
    mockedRegisterUser.mockResolvedValueOnce(testUser)
    mockedLogin.mockResolvedValueOnce({ access_token: 'signup-token', token_type: 'bearer' })
    mockedGetCurrentUser.mockResolvedValueOnce(testUser)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))

    await act(async () => {
      screen.getByText('signup').click()
    })

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(mockedRegisterUser).toHaveBeenCalledWith('a@example.com', 'password123')
    expect(mockedLogin).toHaveBeenCalledWith('a@example.com', 'password123')
  })

  it('logout clears the session', async () => {
    localStorage.setItem('auth_token', 'stored-token')
    mockedGetCurrentUser.mockResolvedValueOnce(testUser)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    await act(async () => {
      screen.getByText('logout').click()
    })

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    expect(screen.getByTestId('token')).toHaveTextContent('')
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('completeOnboarding marks the current user as onboarded', async () => {
    localStorage.setItem('auth_token', 'stored-token')
    mockedGetCurrentUser.mockResolvedValueOnce(testUser)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('onboarded')).toHaveTextContent('false'))

    await act(async () => {
      screen.getByText('complete-onboarding').click()
    })

    expect(screen.getByTestId('onboarded')).toHaveTextContent('true')
  })
})

