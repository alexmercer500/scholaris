import { useCallback, useMemo, useState } from 'react'

export interface GridCoordinate {
  studentId: string
  date: string
}

export function isSameCell(a: GridCoordinate, b: GridCoordinate): boolean {
  return a.studentId === b.studentId && a.date === b.date
}

export function useGridSelection() {
  const [cells, setCells] = useState<GridCoordinate[]>([])

  const toggle = useCallback((coordinate: GridCoordinate) => {
    setCells((current) => {
      const exists = current.some((cell) => isSameCell(cell, coordinate))
      if (exists) {
        return current.filter((cell) => !isSameCell(cell, coordinate))
      }
      return [...current, coordinate]
    })
  }, [])

  const selectAll = useCallback((coordinates: GridCoordinate[]) => {
    setCells(coordinates)
  }, [])

  const clear = useCallback(() => {
    setCells([])
  }, [])

  const isSelected = useCallback(
    (coordinate: GridCoordinate) => cells.some((cell) => isSameCell(cell, coordinate)),
    [cells],
  )

  const key = useMemo(() => cells.map((cell) => `${cell.studentId}|${cell.date}`).sort().join(','), [cells])

  return {
    cells,
    key,
    toggle,
    selectAll,
    clear,
    isSelected,
  }
}
