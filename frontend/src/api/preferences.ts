import { apiClient } from './client'
import type { OnboardingFormValues } from '../schemas/onboarding'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface OnboardingNotificationPreferences {
  crypto_assets: string[]
  content_types: string[]
}

export interface PreferencesPayload {
  trading_strategy: string
  risk_level?: RiskLevel
  notification_preferences?: OnboardingNotificationPreferences
}

export interface PreferencesResponse extends PreferencesPayload {
  id: number
  user_id: number
  created_at: string
  updated_at: string
}

const INVESTOR_TYPE_TO_RISK_LEVEL: Record<string, RiskLevel> = {
  hodler: 'low',
  day_trader: 'high',
  nft_collector: 'medium',
}

const INVESTOR_TYPE_TO_TRADING_STRATEGY: Record<string, string> = {
  hodler: 'long_term_hold',
  day_trader: 'active_trading',
  nft_collector: 'nft_collecting',
}

export function toPreferencesPayload(values: OnboardingFormValues): PreferencesPayload {
  return {
    trading_strategy: INVESTOR_TYPE_TO_TRADING_STRATEGY[values.investorType] ?? 'balanced_growth',
    risk_level: INVESTOR_TYPE_TO_RISK_LEVEL[values.investorType],
    notification_preferences: {
      crypto_assets: values.cryptoAssets,
      content_types: values.contentTypes,
    },
  }
}

export function submitPreferences(
  payload: PreferencesPayload,
  token: string,
): Promise<PreferencesResponse> {
  return apiClient.post<PreferencesResponse>('/preferences', payload, token)
}
