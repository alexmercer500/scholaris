import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, RefreshCw, Calendar, ClipboardEdit } from 'lucide-react'
import { toast } from 'sonner'
import { TopAppBar } from '@components/layout/TopAppBar'
import { DataGrid } from '@components/ui/DataGrid'
import { BulkCorrectionDrawer, type BulkCell } from '../components/BulkCorrectionDrawer'
import { useUrlState } from '../hooks/useUrlState'
import { useRegister } from '../api/attendanceApi'
import { useOptimisticMutation } from '../hooks/useOptimisticMutation'
import { useRegisterColumns } from '../hooks/useRegisterColumns'
import { getClassOptions } from '@mocks/db/attendance'
import type { AttendanceStatus } from '../types'

const CLASSES = getClassOptions()

function monthOptions(): string[] {
  const options: string[] = []
  const now = new Date()
  for (let i = 8; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    options.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  }
  return options
}

export function AttendancePage() {
  const navigate = useNavigate()
  const [classId, setClassId] = useUrlState<string>('classId', 'g11a')
  const [month, setMonth] = useUrlState<string>('month', monthOptions()[8] ?? '')
  const [search, setSearch] = useUrlState<string>('search', '')
  const [filter, setFilter] = useUrlState<AttendanceStatus | ''>('filter', '')

  const registerQuery = useRegister(classId, month)
  const optimistic = useOptimisticMutation(classId)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const studentsById = useMemo(() => {
    const map = new Map<string, { name: string; status: 'active' | 'inactive' | 'transferred' }>()
    for (const student of registerQuery.data?.students ?? []) {
      map.set(student.id, { name: student.name, status: student.status })
    }
    return map
  }, [registerQuery.data])

  const excusedCountByStudent = useMemo(() => {
    const map = new Map<string, number>()
    for (const entry of registerQuery.data?.entries ?? []) {
      if (entry.status === 'excused') {
        map.set(entry.studentId, (map.get(entry.studentId) ?? 0) + 1)
      }
    }
    return map
  }, [registerQuery.data])

  const holidays = useMemo(
    () => new Set(registerQuery.data?.holidays ?? []),
    [registerQuery.data],
  )

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (registerQuery.data?.students ?? []).filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query)
      return matchesSearch
    })
  }, [registerQuery.data, search])

  const getStatus = optimistic.getStatus
  const isPending = optimistic.isPending
  const handleSet = (studentId: string, date: string, status: AttendanceStatus) => {
    optimistic.markCell(studentId, date, status)
  }

  const columns = useRegisterColumns(
    rows,
    month,
    holidays,
    getStatus,
    isPending,
    handleSet,
  )

  const markAllPresent = () => {
    const today = new Date()
    const target = `${month}-${String(today.getDate()).padStart(2, '0')}`
    if (!rows.length) return
    for (const row of rows) {
      handleSet(row.id, target, 'present')
    }
    toast.success('Marked all present')
  }

  const openDaySheet = () => {
    const today = `${month}-${String(new Date().getDate()).padStart(2, '0')}`
    navigate(`/attendance/${today}?classId=${classId}`)
  }

  const today = `${month}-${String(new Date().getDate()).padStart(2, '0')}`
  const bulkCells: BulkCell[] = holidays.has(today)
    ? []
    : rows.map((row) => ({ studentId: row.id, date: today }))

  const applyBulk = (
    changes: Array<{ studentId: string; date: string; status: AttendanceStatus; reason?: string }>,
  ) => {
    for (const change of changes) {
      optimistic.markCell(change.studentId, change.date, change.status)
    }
  }

  return (
    <>
      <TopAppBar>
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Attendance</h2>
          <p className="text-sm text-on-surface-variant">
            {classId.toUpperCase()} · {month}
          </p>
        </div>
      </TopAppBar>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {CLASSES.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.label}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {monthOptions().map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="pl-9 pr-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as AttendanceStatus | '')}
          className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="half-day">Half day</option>
          <option value="excused">Excused</option>
        </select>

        <button
          type="button"
          onClick={markAllPresent}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim"
        >
          <Calendar className="w-4 h-4" />
          Mark all present
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          disabled={bulkCells.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold hover:bg-surface-container disabled:opacity-50"
        >
          <ClipboardEdit className="w-4 h-4" />
          Bulk correct
        </button>

        <button
          type="button"
          onClick={openDaySheet}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold hover:bg-surface-container"
        >
          Today
        </button>

        {optimistic.failedCount > 0 && (
          <button
            type="button"
            onClick={optimistic.retryFailed}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-error-container text-on-error-container text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Retry {optimistic.failedCount}
          </button>
        )}
      </div>

      {registerQuery.isLoading ? (
        <div className="flex items-center justify-center h-64 text-on-surface-variant">Loading register...</div>
      ) : registerQuery.isError ? (
        <div className="flex items-center justify-center h-64 text-error">
          Failed to load register
        </div>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={40}
          headerHeight={36}
          bodyHeight={520}
          rowKey={(row) => row.id}
          cellKey={(key, columnId) => `${key}|${columnId}`}
          emptyMessage="No students match"
        />
      )}

      <BulkCorrectionDrawer
        cells={bulkCells}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        studentsById={studentsById}
        excusedCountByStudent={excusedCountByStudent}
        holidayDates={holidays}
        onApply={applyBulk}
      />
    </>
  )
}
