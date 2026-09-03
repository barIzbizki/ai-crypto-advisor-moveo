import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="page">
      <div className="card">
        <div className="card__header">
          <h1 className="card__title">{title}</h1>
          <p className="card__subtitle">{subtitle}</p>
        </div>
        {children}
        <div className="card__footer">{footer}</div>
      </div>
    </div>
  )
}
