import { Skeleton } from './Skeleton'

/**
 * Table-shaped loading placeholder: a header bar + a few shimmering rows,
 * styled to match the Students directory table card.
 */
export function SkeletonTable() {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden grow">
      <div className="p-6">
        {/* Header bar */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-40 ml-auto" />
        </div>

        {/* Column header */}
        <div className="grid grid-cols-6 gap-4 py-3 border-b border-outline-variant/30 mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 items-center py-3 border-b border-outline-variant/10"
          >
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
