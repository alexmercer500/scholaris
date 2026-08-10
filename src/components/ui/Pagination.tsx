import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@lib/cn'

interface PaginationProps {
  pageIndex: number
  pageSize: number
  totalItems: number
  onPageChange: (newPageIndex: number) => void
  className?: string
}

export function Pagination({
  pageIndex,
  pageSize,
  totalItems,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeIndex = Math.min(pageIndex, totalPages - 1)

  const firstShown = totalItems === 0 ? 0 : safeIndex * pageSize + 1
  const lastShown = Math.min((safeIndex + 1) * pageSize, totalItems)

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 bg-white',
        className,
      )}
    >
      {/* Summary copy */}
      <p className="text-sm text-on-surface-variant font-medium">
        {totalItems === 0 ? (
          'No results'
        ) : (
          <>
            Showing{' '}
            <span className="font-bold text-on-surface">{firstShown}</span> to{' '}
            <span className="font-bold text-on-surface">{lastShown}</span> of{' '}
            <span className="font-bold text-on-surface">{totalItems}</span> items
          </>
        )}
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(safeIndex - 1)}
          disabled={safeIndex === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i)}
            className={cn(
              'w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors',
              i === safeIndex
                ? 'bg-primary text-on-primary font-bold'
                : 'text-on-surface hover:bg-surface-container',
            )}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(safeIndex + 1)}
          disabled={safeIndex === totalPages - 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
