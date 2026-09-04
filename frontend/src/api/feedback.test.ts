import { describe, expect, it, vi } from 'vitest'
import { submitFeedback } from './feedback'
import { apiClient, ApiError } from './client'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

const mockedPost = vi.mocked(apiClient.post)

describe('submitFeedback', () => {
  it('posts content_id and is_upvote to /feedback with the auth token', async () => {
    mockedPost.mockResolvedValueOnce({
      feedback: {
        id: 1,
        user_id: 1,
        content_id: 'coin_1',
        is_upvote: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      existing_votes: [],
      dashboard_content: null,
    })

    const result = await submitFeedback('coin_1', true, 'test-token')

    expect(mockedPost).toHaveBeenCalledWith(
      '/feedback',
      { content_id: 'coin_1', is_upvote: true },
      'test-token',
    )
    expect(result.feedback.is_upvote).toBe(true)
  })

  it('propagates an ApiError from a non-OK response', async () => {
    mockedPost.mockRejectedValueOnce(new ApiError(422, 'Invalid content_id'))

    await expect(submitFeedback('', true, 'test-token')).rejects.toThrow('Invalid content_id')
  })
})
