import { describe, expect, it, vi } from 'vitest'
import { submitPreferences, toPreferencesPayload } from './preferences'
import { apiClient } from './client'
import type { OnboardingFormValues } from '../schemas/onboarding'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedPost = vi.mocked(apiClient.post)

describe('toPreferencesPayload', () => {
  it('maps investor type to risk_level and a derived trading_strategy', () => {
    const values: OnboardingFormValues = {
      cryptoAssets: ['BTC', 'ETH'],
      investorType: 'hodler',
      contentTypes: ['Market News'],
    }

    expect(toPreferencesPayload(values)).toEqual({
      trading_strategy: 'long_term_hold',
      risk_level: 'low',
      notification_preferences: {
        crypto_assets: ['BTC', 'ETH'],
        content_types: ['Market News'],
      },
    })
  })

  it('maps crypto assets and content types into notification_preferences', () => {
    const values: OnboardingFormValues = {
      cryptoAssets: ['SOL'],
      investorType: 'day_trader',
      contentTypes: ['Charts', 'Social'],
    }

    const payload = toPreferencesPayload(values)

    expect(payload.risk_level).toBe('high')
    expect(payload.trading_strategy).toBe('active_trading')
    expect(payload.notification_preferences).toEqual({
      crypto_assets: ['SOL'],
      content_types: ['Charts', 'Social'],
    })
  })

  it('maps the NFT collector investor type to a medium risk level', () => {
    const values: OnboardingFormValues = {
      cryptoAssets: ['ETH'],
      investorType: 'nft_collector',
      contentTypes: ['Fun'],
    }

    const payload = toPreferencesPayload(values)

    expect(payload.risk_level).toBe('medium')
    expect(payload.trading_strategy).toBe('nft_collecting')
  })
})

describe('submitPreferences', () => {
  it('posts the payload to /preferences with the auth token', async () => {
    mockedPost.mockResolvedValueOnce({
      id: 1,
      user_id: 1,
      trading_strategy: 'balanced_growth',
      risk_level: 'medium',
      notification_preferences: { crypto_assets: ['BTC'], content_types: ['Market News'] },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    })

    const payload = {
      trading_strategy: 'balanced_growth',
      risk_level: 'medium' as const,
      notification_preferences: { crypto_assets: ['BTC'], content_types: ['Market News'] },
    }

    const result = await submitPreferences(payload, 'test-token')

    expect(mockedPost).toHaveBeenCalledWith('/preferences', payload, 'test-token')
    expect(result.id).toBe(1)
  })
})
