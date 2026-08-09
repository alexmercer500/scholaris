import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@lib/cn'

type StatTone = 'primary' | 'tertiary' | 'secondary' | 'error'

interface StatCardTones {
  chip: string
  badge: string
}

const toneClasses: Record<StatTone, StatCardTones> = {
  primary: {
    chip: 'bg-primary-container/30 text-primary',
    badge: 'text-primary bg-primary-container/20',
  },
  tertiary: {
    chip: 'bg-tertiary-container/30 text-tertiary',
    badge: 'text-tertiary bg-tertiary-container/20',
  },
  secondary: {
    chip: 'bg-secondary-container text-on-secondary-container',
    badge: 'text-secondary bg-secondary-container/30',
  },
  error: {
    chip: 'bg-error-container/30 text-error',
    badge: 'text-error bg-error-container/30',
  },
}

interface StatCardProps {
  label: string
  value: ReactNode
  icon: LucideIcon
  /** Optional accent: controls the icon chip + badge coloring. */
  tone?: StatTone
  /** Optional badge/trend shown in the top-right. */
  badge?: string
  /** Optional small note under the value. */
  caption?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  badge,
  caption,
  className,
}: StatCardProps) {
  const tones = toneClasses[tone]

  return (
    <div
      className={cn(
        'bg-surface-bright p-6 rounded-[12px] shadow-soft border border-outline-variant/20 flex flex-col',
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            tones.chip,
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span
            className={cn('text-xs font-bold px-2 py-1 rounded-full', tones.badge)}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-sm font-semibold mb-1">
        {label}
      </p>
      <p className="font-headline text-3xl font-bold text-on-surface">
        {value}
      </p>
      {caption && (
        <p className="text-xs text-on-surface-variant mt-1">{caption}</p>
      )}
    </div>
  )
}
