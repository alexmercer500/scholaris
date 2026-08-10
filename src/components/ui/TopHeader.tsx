import type { ReactNode } from 'react'

interface TopHeaderProps {
  title: string
  subtitle?: string
  /** Action buttons rendered on the right of the header band. */
  actions?: ReactNode
  /** Page content rendered below the header band. */
  children?: ReactNode
  className?: string
}

/**
 * Page-level wrapper: renders a header band (title / subtitle / actions) on
 * top and the page content below it. Replaces the standalone <PageHeader />
 * so the header is a fixed band and the content fills the remaining space.
 */
export function TopHeader({
  title,
  subtitle,
  actions,
  children,
  className,
}: TopHeaderProps) {
  return (
    <div className={`flex flex-col h-full ${className ?? ''}`}>
      {/* Header band */}
      <header className="flex justify-between items-center gap-4 py-4 border-b border-outline-variant/20 mb-6">
        <div className="min-w-0">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-0.5">
            {title}
          </h2>
          {subtitle && (
            <p className="text-on-surface-variant text-base">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex gap-3 shrink-0">{actions}</div>}
      </header>

      {/* Body (fills remaining height) */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}
