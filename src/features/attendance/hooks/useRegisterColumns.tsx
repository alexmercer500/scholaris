import { useMemo } from 'react'
import type { Column } from '@components/ui/DataGrid'
import type { AttendanceStatus } from '../types'
import { StatusCell } from '../components/StatusCell'
import { nextStatus } from '../statusMeta'

export interface RegisterRow {
  id: string
  rollNumber: string
  name: string
  status: 'active' | 'inactive' | 'transferred'
}

export function useRegisterColumns(
  month: string,
  holidays: Set<string>,
  getStatus: (studentId: string, date: string) => AttendanceStatus,
  isPending: (studentId: string, date: string) => boolean,
  onSet: (studentId: string, date: string, status: AttendanceStatus) => void,
) {
  return useMemo(() => {
    const stickyColumns: Column<RegisterRow>[] = [
      {
        id: 'roll',
        width: 90,
        stickyLeft: true,
        header: 'Roll',
        cell: (row) => {
          return <span className="px-3 text-xs font-medium text-on-surface-variant">{row.rollNumber}</span>
        },
      },
      {
        id: 'name',
        width: 200,
        stickyLeft: true,
        header: 'Student',
        cell: (row) => {
          return <span className="px-3 text-sm font-semibold text-on-surface">{row.name}</span>
        },
      },
    ]

    const dayColumns: Column<RegisterRow>[] = []

    const [year, monthIndex] = month.split('-').map(Number)
    const totalDays = month ? new Date(year, monthIndex, 0).getDate() : 0

    for (let day = 1; day <= totalDays; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`
      const isHoliday = holidays.has(date)
      const targetDate = new Date(`${date}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isFuture = targetDate > today
      dayColumns.push({
        id: date,
        width: 52,
        header: day,
        cell: (row) => {
          const status = getStatus(row.id, date)
          return (
            <StatusCell
              status={status}
              holiday={isHoliday}
              disabled={isFuture}
              pending={isPending(row.id, date)}
              title={isFuture ? 'Future dates cannot be marked' : `${row.name} ${day}`}
              onClick={() => !isHoliday && !isFuture && onSet(row.id, date, nextStatus(status))}
            />
          )
        },
      })
    }

    return [...stickyColumns, ...dayColumns]
  }, [month, holidays, getStatus, isPending, onSet])
}
