import { useMemo } from 'react'
import { useRegister } from '../api/attendanceApi'
import { STATUS_LABELS, STATUS_COLORS } from '../statusMeta'
import type { AttendanceStatus } from '../types'

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

interface StudentAttendancePanelProps {
  studentId: string
  classId: string
}

export function StudentAttendancePanel({ studentId, classId }: StudentAttendancePanelProps) {
  const attendanceClass = classId
  const month = currentMonth()
  const { data, isLoading, isError } = useRegister(attendanceClass, month)

  const attendanceStudentId = `${attendanceClass}-${studentId}`

  const summary = useMemo(() => {
    if (!data) return null
    const mine = data.entries.filter((entry) => entry.studentId === studentId)
    const counts: Record<string, number> = {}
    for (const entry of mine) {
      counts[entry.status] = (counts[entry.status] ?? 0) + 1
    }
    const present = (counts['present'] ?? 0) + (counts['late'] ?? 0)
    const total = mine.length
    return {
      total,
      present,
      percentage: total ? Math.round((present / total) * 100) : 0,
      counts,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, attendanceStudentId])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 h-40 animate-pulse" />
    )
  }

  if (isError || !summary) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-container/20 p-5 text-sm text-error">
        Attendance data is temporarily unavailable.
      </div>
    )
  }

  const legend: AttendanceStatus[] = ['present', 'absent', 'late', 'half-day', 'excused']

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
      <header className="px-5 py-4 border-b border-outline-variant/20">
        <h3 className="font-headline text-lg font-bold text-on-surface">Monthly attendance</h3>
        <p className="text-sm text-on-surface-variant">{month}</p>
      </header>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-end gap-3">
          <span className="font-headline text-4xl font-bold text-primary">{summary.percentage}%</span>
          <span className="text-sm text-on-surface-variant mb-1">present this month</span>
        </div>

        <div>
          <div className="flex gap-1.5 flex-wrap">
            {legend.map((status) => (
              <span
                key={status}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                {STATUS_LABELS[status]} {summary.counts[status] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
