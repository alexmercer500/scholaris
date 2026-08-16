import { memo, type ReactNode, type CSSProperties, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface Column<T> {
  id: string
  width: number
  header: ReactNode
  cell: (row: T, column: Column<T>) => ReactNode
  stickyLeft?: boolean
  style?: CSSProperties
}

export interface DataGridProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowHeight?: number
  headerHeight?: number
  bodyHeight?: number
  rowKey: (row: T) => string
  cellKey: (rowKey: string, columnId: string) => string
  emptyMessage?: string
}

interface CellProps<T> {
  row: T
  column: Column<T>
}

function GridCell<T>({ row, column }: CellProps<T>) {
  return (
    <div
      className="flex items-center overflow-hidden"
      style={{ width: column.width, minWidth: column.width }}
    >
      {column.cell(row, column)}
    </div>
  )
}

const MemoCell = memo(GridCell) as typeof GridCell

export function DataGrid<T>({
  rows,
  columns,
  rowHeight = 40,
  headerHeight = 36,
  bodyHeight = 560,
  rowKey,
  cellKey,
  emptyMessage = 'No records',
}: DataGridProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const stickyColumns = columns.filter((column) => column.stickyLeft)
  const scrollColumns = columns.filter((column) => !column.stickyLeft)
  const stickyWidth = stickyColumns.reduce((sum, column) => sum + column.width, 0)
  const totalScrollWidth = scrollColumns.reduce((sum, column) => sum + column.width, 0)
  const totalWidth = stickyWidth + totalScrollWidth

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  const columnVirtualizer = useVirtualizer({
    count: scrollColumns.length,
    getScrollElement: () => scrollRef.current,
    horizontal: true,
    estimateSize: (index) => scrollColumns[index]?.width ?? 80,
    overscan: 6,
  })

  const rowsVirtual = rowVirtualizer.getVirtualItems()
  const columnsVirtual = columnVirtualizer.getVirtualItems()

  return (
    <div className="flex flex-col overflow-hidden border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
      <div
        ref={scrollRef}
        className="relative overflow-auto scrollbar-thin"
        style={{ height: bodyHeight }}
      >
        <div
          className="relative"
          style={{ height: rowVirtualizer.getTotalSize() + headerHeight, width: totalWidth }}
        >
          {/* Sticky header (day names) */}
          <div
            className="absolute top-0 left-0 flex z-20"
            style={{ height: headerHeight, width: totalWidth }}
          >
            <div
              className="sticky left-0 z-30 flex bg-surface-container border-b border-r border-outline-variant/30"
              style={{ width: stickyWidth, minWidth: stickyWidth }}
            >
              {stickyColumns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center font-label font-bold text-on-surface-variant"
                  style={{ width: column.width, minWidth: column.width }}
                >
                  <div className="px-3 text-sm whitespace-nowrap">{column.header}</div>
                </div>
              ))}
            </div>
            <div className="flex bg-surface-container border-b border-outline-variant/30">
              {columnsVirtual.map((virtualColumn) => {
                const column = scrollColumns[virtualColumn.index]
                return (
                  <div
                    key={column.id}
                    className="flex items-center font-label font-bold text-on-surface-variant"
                    style={{
                      width: column.width,
                      minWidth: column.width,
                      transform: `translateX(${virtualColumn.start}px)`,
                    }}
                  >
                    <div className="px-3 text-sm whitespace-nowrap">{column.header}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {rowsVirtual.map((virtualRow) => {
            const row = rows[virtualRow.index]
            const key = rowKey(row)
            return (
              <div
                key={key}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                className="absolute top-0 left-0 flex"
                style={{ height: rowHeight, transform: `translateY(${virtualRow.start + headerHeight}px)` }}
              >
                <div className="sticky left-0 z-10 flex bg-surface-container-lowest border-b border-outline-variant/10">
                  {stickyColumns.map((column) => (
                    <div
                      key={cellKey(key, column.id)}
                      className="border-r border-outline-variant/10"
                      style={{ width: column.width, minWidth: column.width }}
                    >
                      <MemoCell row={row} column={column} />
                    </div>
                  ))}
                </div>
                <div className="flex">
                  {columnsVirtual.map((virtualColumn) => {
                    const column = scrollColumns[virtualColumn.index]
                    return (
                      <div
                        key={cellKey(key, column.id)}
                        className="border-r border-outline-variant/10"
                        style={{
                          width: column.width,
                          minWidth: column.width,
                          transform: `translateX(${virtualColumn.start}px)`,
                        }}
                      >
                        <MemoCell row={row} column={column} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {rows.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
