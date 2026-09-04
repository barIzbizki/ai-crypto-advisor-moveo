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
  it('maps investor type and assets directly to typed fields', () => {
    const values: OnboardingFormValues = {
      cryptoAssets: ['BTC', 'ETH'],
      investorType: 'hodler',
      contentTypes: ['Market News'],
    }

    expect(toPreferencesPayload(values)).toEqual({
      investor_type: 'hodler',
      crypto_assets: ['BTC', 'ETH'],
      content_types: ['Market News'],
    })
  })

  it('maps day trader investor type with multiple assets', () => {
    const values: OnboardingFormValues = {
      cryptoAssets: ['SOL'],
      investorType: 'day_trader',
      contentTypes: ['Charts', 'Social'],
    }

    const payload = toPreferencesPayload(values)

    expect(payload.investor_type).toBe('day_trader')
    expect(payload.crypto_assets).toEqual(['SOL'])
    expect(payload.content_types).toEqual(['Charts', 'Social'])
  })

  it('maps the NFT collector investor type with content types', () => {
    const values: OnboardingFormValues = {
      cryptoAssets: ['ETH'],
      investorType: 'nft_collector',
      contentTypes: ['Fun'],
    }

    const payload = toPreferencesPayload(values)

    expect(payload.investor_type).toBe('nft_collector')
    expect(payload.crypto_assets).toEqual(['ETH'])
    expect(payload.content_types).toEqual(['Fun'])
  })
})

describe('submitPreferences', () => {
  it('posts the payload to /preferences with the auth token', async () => {
    mockedPost.mockResolvedValueOnce({
      id: 1,
      user_id: 1,
      investor_type: 'hodler',
      crypto_assets: ['BTC'],
      content_types: ['Market News'],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    })

    const payload = {
      investor_type: 'hodler',
      crypto_assets: ['BTC'],
      content_types: ['Market News'],
    }

    const result = await submitPreferences(payload, 'test-token')

    expect(mockedPost).toHaveBeenCalledWith('/preferences', payload, 'test-token')
    expect(result.id).toBe(1)
  })
})
