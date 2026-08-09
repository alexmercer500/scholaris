import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h2 className="font-headline text-4xl font-bold text-on-surface mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-on-surface-variant text-lg">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  )
}
