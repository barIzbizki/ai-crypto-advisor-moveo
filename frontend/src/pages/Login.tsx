import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api'
import { AuthCard, FormField } from '../components'
import type { RedirectLocationState } from '../components'
import { useAuth } from '../context'
import { loginSchema } from '../schemas/auth'
import type { LoginFormValues } from '../schemas/auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      const state = location.state as RedirectLocationState | null
      const redirectTo = state?.from?.pathname ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setFormError('Incorrect email or password.')
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <p>
          Need an account? <Link to="/signup">Sign up</Link>
        </p>
      }
    >
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          {...register('email')}
        />

        <FormField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
          {...register('password')}
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Log in
        </button>
      </form>
    </AuthCard>
  )
}
