import { apiClient } from './client'
import type { OnboardingFormValues } from '../schemas/onboarding'

export interface PreferencesPayload {
  investor_type: string
  crypto_assets: string[]
  content_types: string[]
}

export interface PreferencesResponse extends PreferencesPayload {
  id: number
  user_id: number
  created_at: string
  updated_at: string
}

export function toPreferencesPayload(values: OnboardingFormValues): PreferencesPayload {
  return {
    investor_type: values.investorType,
    crypto_assets: values.cryptoAssets,
    content_types: values.contentTypes,
  }
}

export function submitPreferences(
  payload: PreferencesPayload,
  token: string,
): Promise<PreferencesResponse> {
  return apiClient.post<PreferencesResponse>('/preferences', payload, token)
}

export function getPreferences(token: string): Promise<PreferencesResponse> {
  return apiClient.get<PreferencesResponse>('/preferences', token)
}
