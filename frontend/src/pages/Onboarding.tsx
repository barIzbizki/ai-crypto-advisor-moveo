import { useState } from 'react'
import type { FormEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError, submitPreferences, toPreferencesPayload } from '../api'
import { useAuth } from '../context'
import {
  contentTypeOptions,
  cryptoAssetOptions,
  investorTypeOptions,
  onboardingDefaultValues,
  onboardingSchema,
  onboardingSteps,
} from '../schemas/onboarding'
import type { OnboardingFormValues } from '../schemas/onboarding'

export function OnboardingPage() {
  const { token, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: onboardingDefaultValues,
  })

  const isLastStep = step === onboardingSteps.length - 1

  const handleBack = () => {
    setStep((current) => Math.max(0, current - 1))
  }

  const onSubmit = async (values: OnboardingFormValues) => {
    if (!token) {
      setSubmitError('Your session has expired. Please log in again.')
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await submitPreferences(toPreferencesPayload(values), token)
      completeOnboarding()
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitForm = handleSubmit(onSubmit)

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLastStep) {
      await submitForm(event)
      return
    }
    const valid = await trigger(onboardingSteps[step].fields)
    if (valid) {
      setStep((current) => current + 1)
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Set up your preferences</h1>

        <ol className="onboarding-steps">
          {onboardingSteps.map((s, index) => (
            <li
              key={s.title}
              className={
                'onboarding-steps__item' +
                (index === step ? ' is-current' : '') +
                (index < step ? ' is-done' : '')
              }
            >
              <span className="onboarding-steps__marker">{index < step ? '✓' : index + 1}</span>
              <span className="onboarding-steps__label">{s.title}</span>
            </li>
          ))}
        </ol>

        <form className="form" noValidate onSubmit={handleFormSubmit}>
          {step === 0 && (
            <fieldset className="onboarding-field">
              <legend>What crypto assets are you interested in?</legend>
              {cryptoAssetOptions.map((asset) => (
                <label key={asset} className="option">
                  <input type="checkbox" value={asset} {...register('cryptoAssets')} />
                  {asset}
                </label>
              ))}
              {errors.cryptoAssets && (
                <p className="field-error" role="alert">
                  {errors.cryptoAssets.message}
                </p>
              )}
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="onboarding-field">
              <legend>What type of investor are you?</legend>
              {investorTypeOptions.map((option) => (
                <label key={option.value} className="option">
                  <input type="radio" value={option.value} {...register('investorType')} />
                  {option.label}
                </label>
              ))}
              {errors.investorType && (
                <p className="field-error" role="alert">
                  {errors.investorType.message}
                </p>
              )}
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="onboarding-field">
              <legend>What kind of content would you like to see?</legend>
              {contentTypeOptions.map((contentType) => (
                <label key={contentType} className="option">
                  <input type="checkbox" value={contentType} {...register('contentTypes')} />
                  {contentType}
                </label>
              ))}
              {errors.contentTypes && (
                <p className="field-error" role="alert">
                  {errors.contentTypes.message}
                </p>
              )}
            </fieldset>
          )}

          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}

          <div className="onboarding-actions">
            {step > 0 && (
              <button type="button" className="btn" onClick={handleBack} disabled={isSubmitting}>
                Back
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isLastStep ? (isSubmitting ? 'Submitting…' : 'Submit') : 'Next'}
            </button>
          </div>
        </form>

        <p className="onboarding-hint">Your preferences can be updated anytime after onboarding.</p>
      </div>
    </div>
  )
}
