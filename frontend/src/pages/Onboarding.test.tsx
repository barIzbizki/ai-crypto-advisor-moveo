import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OnboardingPage } from './Onboarding'
import { ApiError, submitPreferences } from '../api'
import { useAuth } from '../context'

vi.mock('../context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>()
  return {
    ...actual,
    submitPreferences: vi.fn(),
  }
})

const mockedUseAuth = vi.mocked(useAuth)
const mockedSubmitPreferences = vi.mocked(submitPreferences)
const completeOnboardingMock = vi.fn()

function renderOnboardingPage() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function completeAllSteps(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('BTC'))
  await user.click(screen.getByRole('button', { name: /next/i }))

  await user.click(screen.getByLabelText('HODLer'))
  await user.click(screen.getByRole('button', { name: /next/i }))

  await user.click(screen.getByLabelText('Market News'))
}

beforeEach(() => {
  completeOnboardingMock.mockReset()
  mockedSubmitPreferences.mockReset()
  mockedUseAuth.mockReturnValue({
    user: { id: 1, email: 'a@example.com', onboarded: false, created_at: '2026-01-01T00:00:00Z' },
    status: 'authenticated',
    token: 'test-token',
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    completeOnboarding: completeOnboardingMock,
  })
})

describe('OnboardingPage', () => {
  it('blocks advancing to the next step until a crypto asset is selected', async () => {
    const user = userEvent.setup()
    renderOnboardingPage()

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(await screen.findByText(/select at least one crypto asset/i)).toBeInTheDocument()
    expect(screen.getByLabelText('BTC')).toBeInTheDocument()
    expect(mockedSubmitPreferences).not.toHaveBeenCalled()
  })

  it('advances through steps and preserves values when navigating back', async () => {
    const user = userEvent.setup()
    renderOnboardingPage()

    await user.click(screen.getByLabelText('BTC'))
    await user.click(screen.getByRole('button', { name: /next/i }))

    await user.click(screen.getByLabelText('Day Trader'))
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByLabelText('Market News')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByLabelText('Day Trader')).toBeChecked()

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByLabelText('BTC')).toBeChecked()
  })

  it('submits the mapped preferences on the final step and navigates to the dashboard', async () => {
    mockedSubmitPreferences.mockResolvedValueOnce({
      id: 1,
      user_id: 1,
      trading_strategy: 'long_term_hold',
      risk_level: 'low',
      notification_preferences: { crypto_assets: ['BTC'], content_types: ['Market News'] },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    })
    const user = userEvent.setup()
    renderOnboardingPage()

    await completeAllSteps(user)
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
    expect(mockedSubmitPreferences).toHaveBeenCalledWith(
      {
        trading_strategy: 'long_term_hold',
        risk_level: 'low',
        notification_preferences: { crypto_assets: ['BTC'], content_types: ['Market News'] },
      },
      'test-token',
    )
    expect(completeOnboardingMock).toHaveBeenCalled()
  })

  it('shows a loading state while the submission is in flight', async () => {
    let resolveSubmit: (() => void) | undefined
    mockedSubmitPreferences.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSubmit = () =>
            resolve({
              id: 1,
              user_id: 1,
              trading_strategy: 'long_term_hold',
              risk_level: 'low',
              notification_preferences: { crypto_assets: ['BTC'], content_types: ['Market News'] },
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
            })
        }),
    )
    const user = userEvent.setup()
    renderOnboardingPage()

    await completeAllSteps(user)
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByRole('button', { name: /submitting/i })).toBeDisabled()

    resolveSubmit?.()
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
  })

  it('displays a validation error returned by the API on 400', async () => {
    mockedSubmitPreferences.mockRejectedValueOnce(new ApiError(400, 'Invalid preferences'))
    const user = userEvent.setup()
    renderOnboardingPage()

    await completeAllSteps(user)
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText('Invalid preferences')).toBeInTheDocument()
    expect(completeOnboardingMock).not.toHaveBeenCalled()
  })

  it('displays a retryable error message on a network or server error', async () => {
    mockedSubmitPreferences.mockRejectedValueOnce(new Error('Network request failed'))
    const user = userEvent.setup()
    renderOnboardingPage()

    await completeAllSteps(user)
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
  })
})
