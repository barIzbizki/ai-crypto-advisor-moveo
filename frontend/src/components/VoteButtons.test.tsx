import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { VoteButtons } from './VoteButtons'
import { submitFeedback } from '../api'
import { useAuth } from '../context'
import type { FeedbackWithVotesResponse } from '../api'

vi.mock('../api', () => ({
  submitFeedback: vi.fn(),
}))

vi.mock('../context', () => ({
  useAuth: vi.fn(),
}))

const mockedSubmitFeedback = vi.mocked(submitFeedback)
const mockedUseAuth = vi.mocked(useAuth)

function feedbackResponse(isUpvote: boolean): FeedbackWithVotesResponse {
  return {
    feedback: {
      id: 1,
      user_id: 1,
      content_id: 'coin_1',
      is_upvote: isUpvote,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    existing_votes: [],
    dashboard_content: null,
  }
}

beforeEach(() => {
  mockedUseAuth.mockReturnValue({
    user: { id: 1, email: 'a@example.com', onboarded: true, created_at: '2026-01-01T00:00:00Z' },
    status: 'authenticated',
    token: 'test-token',
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    completeOnboarding: vi.fn(),
  })
  mockedSubmitFeedback.mockReset()
})

describe('VoteButtons', () => {
  it('renders with neither control selected when there is no initial vote', () => {
    render(<VoteButtons contentId="coin_1" />)

    expect(screen.getByLabelText('Thumbs up')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByLabelText('Thumbs down')).toHaveAttribute('aria-pressed', 'false')
  })

  it('optimistically selects thumbs up before the request resolves', async () => {
    let resolveRequest: (value: FeedbackWithVotesResponse) => void = () => {}
    mockedSubmitFeedback.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const user = userEvent.setup()

    render(<VoteButtons contentId="coin_1" />)
    await user.click(screen.getByLabelText('Thumbs up'))

    expect(screen.getByLabelText('Thumbs up')).toHaveAttribute('aria-pressed', 'true')
    expect(mockedSubmitFeedback).toHaveBeenCalledWith('coin_1', true, 'test-token')

    resolveRequest(feedbackResponse(true))
    await waitFor(() => expect(screen.getByLabelText('Thumbs up')).toHaveAttribute('aria-pressed', 'true'))
  })

  it('rolls back to the previous state and shows an error when the request fails', async () => {
    mockedSubmitFeedback.mockRejectedValueOnce(new Error('network error'))
    const user = userEvent.setup()

    render(<VoteButtons contentId="coin_1" />)
    await user.click(screen.getByLabelText('Thumbs up'))

    await waitFor(() =>
      expect(screen.getByLabelText('Thumbs up')).toHaveAttribute('aria-pressed', 'false'),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not submit your vote')
  })

  it('switches from thumbs down to thumbs up', async () => {
    mockedSubmitFeedback.mockResolvedValue(feedbackResponse(true))
    const user = userEvent.setup()

    render(<VoteButtons contentId="coin_1" initialVote={false} />)
    await user.click(screen.getByLabelText('Thumbs up'))

    await waitFor(() =>
      expect(screen.getByLabelText('Thumbs up')).toHaveAttribute('aria-pressed', 'true'),
    )
    expect(screen.getByLabelText('Thumbs down')).toHaveAttribute('aria-pressed', 'false')
    expect(mockedSubmitFeedback).toHaveBeenCalledWith('coin_1', true, 'test-token')
  })

  it('does not submit a request when clicking the already-active vote', async () => {
    const user = userEvent.setup()

    render(<VoteButtons contentId="coin_1" initialVote={true} />)
    await user.click(screen.getByLabelText('Thumbs up'))

    expect(mockedSubmitFeedback).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Thumbs up')).toHaveAttribute('aria-pressed', 'true')
  })
})
