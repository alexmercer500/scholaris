import { cn } from '@lib/cn'

interface SkeletonProps {
  className?: string
}

/**
 * Animated placeholder block (grey shimmering pulse) used for loading states.
 * Pair with fixed width/height utilities to shape the placeholder.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-surface-container-high',
        className,
      )}
    />
  )
}
