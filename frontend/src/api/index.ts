import { env } from '../config/env'

export const API_BASE_URL = env.apiBaseUrl

export { apiClient, ApiError } from './client'
export { registerUser, login, getCurrentUser } from './auth'
export type { AuthUser, AuthToken } from './auth'
export { submitPreferences, toPreferencesPayload } from './preferences'
export type {
  PreferencesPayload,
  PreferencesResponse,
  RiskLevel,
  OnboardingNotificationPreferences,
} from './preferences'
export { submitFeedback } from './feedback'
export type { FeedbackResponse, FeedbackWithVotesResponse } from './feedback'

