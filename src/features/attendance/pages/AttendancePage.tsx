import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Search, RefreshCw, Calendar, ClipboardEdit } from 'lucide-react'
import { toast } from 'sonner'
import { TopAppBar } from '@components/layout/TopAppBar'
import { DataGrid } from '@components/ui/DataGrid'
import { Pagination } from '@components/ui/Pagination'
import { BulkCorrectionDrawer, type BulkCell } from '../components/BulkCorrectionDrawer'
import { useRegister } from '../api/attendanceApi'
import { useOptimisticMutation } from '../hooks/useOptimisticMutation'
import { useRegisterColumns } from '../hooks/useRegisterColumns'
import { getClassOptions } from '@mocks/db/attendance'
import type { AttendanceStatus } from '../types'

const CLASSES = getClassOptions()
const DEFAULT_PAGE_SIZE = 10

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
  const [searchParams, setSearchParams] = useSearchParams()

  const classId = searchParams.get('classId') ?? 'g11a'
  const month = searchParams.get('month') ?? (monthOptions()[8] ?? '')
  const search = searchParams.get('search') ?? ''
  const filter = (searchParams.get('filter') as AttendanceStatus | '') ?? ''
  const page = Number(searchParams.get('page') ?? '1') - 1
  const pageSizeParam = searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE)
  const pageSize: number | 'all' =
    pageSizeParam === 'all'
      ? 'all'
      : Number(pageSizeParam) || DEFAULT_PAGE_SIZE
  const pageIndex = Math.max(0, page)

  const setClassId = useCallback(
    (nextClassId: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.set('classId', nextClassId)
        params.set('page', '1')
        return params
      })
    },
    [setSearchParams],
  )

  const setMonth = useCallback(
    (nextMonth: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.set('month', nextMonth)
        params.set('page', '1')
        return params
      })
    },
    [setSearchParams],
  )

  const setSearch = useCallback(
    (nextSearch: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (nextSearch) params.set('search', nextSearch)
        else params.delete('search')
        params.set('page', '1')
        return params
      })
    },
    [setSearchParams],
  )

  const setFilter = useCallback(
    (nextFilter: AttendanceStatus | '') => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (nextFilter) params.set('filter', nextFilter)
        else params.delete('filter')
        params.set('page', '1')
        return params
      })
    },
    [setSearchParams],
  )

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

  const entryStatusByCell = useMemo(() => {
    const map = new Map<string, AttendanceStatus>()
    for (const entry of registerQuery.data?.entries ?? []) {
      map.set(`${entry.studentId}|${entry.date}`, entry.status)
    }
    return map
  }, [registerQuery.data])

  const getCellStatus = useCallback(
    (studentId: string, date: string): AttendanceStatus => {
      return (
        optimistic.getStatus(studentId, date) ??
        entryStatusByCell.get(`${studentId}|${date}`) ??
        'unmarked'
      )
    },
    [entryStatusByCell, optimistic],
  )

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (registerQuery.data?.students ?? []).filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query)
      if (!matchesSearch) return false
      if (!filter) return true

      const [year, monthIndex] = month.split('-').map(Number)
      const totalDays = month ? new Date(year, monthIndex, 0).getDate() : 0
      for (let day = 1; day <= totalDays; day++) {
        const date = `${month}-${String(day).padStart(2, '0')}`
        if (getCellStatus(student.id, date) === filter) return true
      }
      return false
    })
  }, [filter, getCellStatus, month, registerQuery.data, search])

  const effectivePageSize = pageSize === 'all' ? Math.max(rows.length, 1) : pageSize
  const totalPages = Math.max(1, Math.ceil(rows.length / effectivePageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const paginatedRows = useMemo(() => {
    if (pageSize === 'all') return rows
    const start = safePageIndex * pageSize
    return rows.slice(start, start + pageSize)
  }, [pageSize, rows, safePageIndex])

  const handlePageChange = useCallback(
    (nextPageIndex: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.set('page', String(nextPageIndex + 1))
        return params
      })
    },
    [setSearchParams],
  )

  const handlePageSizeChange = useCallback(
    (nextPageSize: number | 'all') => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.set('pageSize', String(nextPageSize))
        params.set('page', '1')
        return params
      })
    },
    [setSearchParams],
  )

  const isPending = optimistic.isPending
  const handleSet = useCallback(
    (studentId: string, date: string, status: AttendanceStatus) => {
      optimistic.markCell(studentId, date, status)
    },
    [optimistic],
  )

  const columns = useRegisterColumns(
    month,
    holidays,
    getCellStatus,
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
    : paginatedRows.map((row) => ({ studentId: row.id, date: today }))

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
          onChange={(e) => {
            setClassId(e.target.value)
          }}
          className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {CLASSES.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.label}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => {
            setMonth(e.target.value)
          }}
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
            onChange={(e) => {
              setSearch(e.target.value)
            }}
            placeholder="Search student..."
            className="pl-9 pr-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as AttendanceStatus | '')
          }}
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
          rows={paginatedRows}
          columns={columns}
          rowHeight={40}
          headerHeight={36}
          bodyHeight={520}
          rowKey={(row) => row.id}
          cellKey={(key, columnId) => `${key}|${columnId}`}
          emptyMessage="No students match"
        />
      )}

      {!registerQuery.isLoading && !registerQuery.isError && rows.length > 0 && (
        <Pagination
          pageIndex={safePageIndex}
          pageSize={pageSize}
          totalItems={rows.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 25, 50, 100, 'all']}
          className="mt-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest"
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
