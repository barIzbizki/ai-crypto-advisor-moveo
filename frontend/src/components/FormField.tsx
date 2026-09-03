import type { InputHTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: FieldError
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error ? 'true' : 'false'} {...inputProps} />
      {error && (
        <p className="field-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
