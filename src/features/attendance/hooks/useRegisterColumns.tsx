import { useMemo } from 'react'
import type { Column } from '@components/ui/DataGrid'
import type { AttendanceStatus } from '../types'
import { StatusCell } from '../components/StatusCell'

export interface RegisterRow {
  id: string
  rollNumber: string
  name: string
  status: 'active' | 'inactive' | 'transferred'
}

export function useRegisterColumns(
  students: RegisterRow[],
  month: string,
  holidays: Set<string>,
  getStatus: (studentId: string, date: string) => AttendanceStatus | undefined,
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
      dayColumns.push({
        id: date,
        width: 52,
        header: day,
        cell: (row) => {
          const status = getStatus(row.id, date) ?? 'unmarked'
          return (
            <StatusCell
              status={status}
              holiday={isHoliday}
              pending={isPending(row.id, date)}
              title={`${row.name} ${day}`}
              onClick={() => !isHoliday && onSet(row.id, date, 'present')}
            />
          )
        },
      })
    }

    return [...stickyColumns, ...dayColumns]
  }, [students, month, holidays, getStatus, isPending, onSet])
}