import { apiClient } from './client'

export interface FeedbackResponse {
  id: number
  user_id: number
  content_id: string
  is_upvote: boolean
  created_at: string
  updated_at: string
}

export interface FeedbackWithVotesResponse {
  feedback: FeedbackResponse
  existing_votes: FeedbackResponse[]
  dashboard_content: Record<string, unknown> | null
}

export function submitFeedback(
  contentId: string,
  isUpvote: boolean,
  token: string,
): Promise<FeedbackWithVotesResponse> {
  return apiClient.post<FeedbackWithVotesResponse>(
    '/feedback',
    { content_id: contentId, is_upvote: isUpvote },
    token,
  )
}
