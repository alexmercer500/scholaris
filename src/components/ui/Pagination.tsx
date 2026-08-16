import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@lib/cn'

interface PaginationProps {
  pageIndex: number
  pageSize: number | 'all'
  totalItems: number
  onPageChange: (newPageIndex: number) => void
  onPageSizeChange?: (newPageSize: number | 'all') => void
  pageSizeOptions?: Array<number | 'all'>
  className?: string
}

type PageItem = number | 'ellipsis'

function getVisiblePageItems(totalPages: number, safeIndex: number): PageItem[] {
  const boundaryCount = 2
  const pages = new Set<number>()

  for (let page = 0; page < Math.min(boundaryCount, totalPages); page++) {
    pages.add(page)
  }

  for (let page = Math.max(totalPages - boundaryCount, 0); page < totalPages; page++) {
    pages.add(page)
  }

  pages.add(safeIndex)

  const orderedPages = Array.from(pages).sort((a, b) => a - b)
  const items: PageItem[] = []

  for (const page of orderedPages) {
    const previous = items[items.length - 1]
    if (typeof previous === 'number' && page - previous > 1) {
      items.push('ellipsis')
    }
    items.push(page)
  }

  return items
}

export function Pagination({
  pageIndex,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const effectivePageSize = pageSize === 'all' ? Math.max(totalItems, 1) : pageSize
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize))
  const safeIndex = Math.min(pageIndex, totalPages - 1)

  const firstShown = totalItems === 0 ? 0 : safeIndex * effectivePageSize + 1
  const lastShown = Math.min((safeIndex + 1) * effectivePageSize, totalItems)
  const visibleItems = getVisiblePageItems(totalPages, safeIndex)

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
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => {
                const value = event.target.value
                onPageSizeChange(value === 'all' ? 'all' : Number(value))
              }}
              className="h-8 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All' : option}
                </option>
              ))}
            </select>
          </label>
        )}

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

        {visibleItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-outline"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                'w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors',
                item === safeIndex
                  ? 'bg-primary text-on-primary font-bold'
                  : 'text-on-surface hover:bg-surface-container',
              )}
              aria-current={item === safeIndex ? 'page' : undefined}
            >
              {item + 1}
            </button>
          ),
        )}

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
    </div>
  )
}
