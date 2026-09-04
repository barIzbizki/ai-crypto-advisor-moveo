import { z } from 'zod'

export const cryptoAssetOptions = ['BTC', 'ETH', 'SOL', 'Stablecoins', 'Altcoins'] as const

export const investorTypeOptions = [
  { value: 'hodler', label: 'HODLer' },
  { value: 'day_trader', label: 'Day Trader' },
  { value: 'nft_collector', label: 'NFT Collector' },
] as const

export const contentTypeOptions = ['Market News', 'Charts', 'Social', 'Fun'] as const

export const cryptoAssetsStepSchema = z.object({
  cryptoAssets: z.array(z.string()).min(1, 'Select at least one crypto asset'),
})

export const investorTypeStepSchema = z.object({
  investorType: z.string().min(1, 'Select an investor type'),
})

export const contentTypesStepSchema = z.object({
  contentTypes: z.array(z.string()).min(1, 'Select at least one content type'),
})

export const onboardingSchema = cryptoAssetsStepSchema
  .merge(investorTypeStepSchema)
  .merge(contentTypesStepSchema)

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

export const onboardingSteps = [
  { fields: ['cryptoAssets'], title: 'Crypto assets' },
  { fields: ['investorType'], title: 'Investor type' },
  { fields: ['contentTypes'], title: 'Content types' },
] as const satisfies ReadonlyArray<{ fields: ReadonlyArray<keyof OnboardingFormValues>; title: string }>

export const onboardingDefaultValues: OnboardingFormValues = {
  cryptoAssets: [],
  investorType: '',
  contentTypes: [],
}
