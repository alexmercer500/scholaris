import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Calendar, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { TopAppBar } from '@components/layout/TopAppBar'
import { useDaySheet } from '../api/attendanceApi'
import { useOptimisticMutation } from '../hooks/useOptimisticMutation'
import { StatusCell } from '../components/StatusCell'
import { nextStatus } from '../statusMeta'
import type { AttendanceStatus } from '../types'

export function DaySheetPage() {
  const { date = '' } = useParams()
  const [searchParams] = useSearchParams()
  const classId = searchParams.get('classId') ?? 'g11a'
  const navigate = useNavigate()

  const { data, isLoading, isError } = useDaySheet(classId, date)
  const optimistic = useOptimisticMutation(classId)

  const rows = useMemo(() => {
    const entriesByStudent = new Map(
      (data?.entries ?? []).map((entry) => [entry.studentId, entry.status] as const),
    )
    return (data?.students ?? []).map((student) => ({
      ...student,
      status: optimistic.getStatus(student.id, date) ?? entriesByStudent.get(student.id) ?? 'unmarked',
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, date, optimistic.getStatus])

  const holidays = useMemo(() => new Set(data?.holidays ?? []), [data])
  const isHoliday = holidays.has(date)

  const markAll = () => {
    if (!rows.length || isHoliday) return
    for (const row of rows) {
      optimistic.markCell(row.id, date, 'present')
    }
    toast.success('All marked present')
  }

  const cycleCell = (rowId: string, current: AttendanceStatus) => {
    if (isHoliday) return
    const next = nextStatus(current)
    optimistic.markCell(rowId, date, next)
  }

  return (
    <>
      <TopAppBar>
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Day Sheet</h2>
          <p className="text-sm text-on-surface-variant">
            {classId.toUpperCase()} · {date}
          </p>
        </div>
      </TopAppBar>

      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => navigate('/attendance')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {!isHoliday && (
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all present
          </button>
        )}

        {optimistic.failedCount > 0 && (
          <span className="text-sm text-error font-medium">
            {optimistic.failedCount} failed — closing updates retries
          </span>
        )}
      </div>

      {isHoliday && (
        <div className="p-4 rounded-xl bg-surface-container-high text-on-surface-variant font-body mb-4">
          This date is a holiday and cannot be marked.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-on-surface-variant">Loading…</div>
      ) : isError ? (
        <div className="flex items-center justify-center h-64 text-error">Failed to load day</div>
      ) : (
        <div className="overflow-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead className="sticky top-0 bg-surface-container text-on-surface-variant text-sm font-label font-bold border-b border-outline-variant/30">
              <tr>
                <th className="py-3 pl-4 font-semibold w-20">Roll</th>
                <th className="py-3 px-3 font-semibold">Student</th>
                <th className="py-3 pr-4 font-semibold w-28 text-center">Mark</th>
                <th className="py-3 pr-4 font-semibold w-32 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container/30">
                  <td className="py-2.5 pl-4 text-xs font-medium text-on-surface-variant">
                    {row.rollNumber}
                  </td>
                  <td className="py-2.5 px-3 text-sm font-semibold text-on-surface">{row.name}</td>
                  <td className="py-1.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      <StatusCell
                        status={row.status}
                        holiday={isHoliday}
                        pending={optimistic.isPending(row.id, date)}
                        title="Toggle status"
                        onClick={() => cycleCell(row.id, row.status)}
                      />
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container-high text-on-surface-variant">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
        <Calendar className="w-4 h-4" />
        Click a status to cycle: unmarked → present → absent → late → half-day → excused
      </div>
    </>
  )
}
