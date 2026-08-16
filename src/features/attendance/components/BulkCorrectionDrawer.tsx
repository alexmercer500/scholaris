import { useMemo } from 'react'
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { AttendanceStatus } from '../types'
import { validateMark, hasExcusedWarning } from '../utils/validation'
import { useFormDraft } from '../hooks/useFormDraft'

export interface BulkCell {
  studentId: string
  date: string
}

interface OverrideRow {
  studentId: string
  status: AttendanceStatus
  reason: string
}

interface BulkForm {
  status: AttendanceStatus
  reason: string
  overrides: OverrideRow[]
  acknowledgeWarning: boolean
}

interface BulkCorrectionDrawerProps {
  cells: BulkCell[]
  open: boolean
  onClose: () => void
  studentsById: Map<string, { name: string; status: 'active' | 'inactive' | 'transferred' }>
  excusedCountByStudent: Map<string, number>
  holidayDates: Set<string>
  onApply: (changes: Array<{ studentId: string; date: string; status: AttendanceStatus; reason?: string }>) => void
}

const INITIAL: BulkForm = {
  status: 'present',
  reason: '',
  overrides: [],
  acknowledgeWarning: false,
}

export function BulkCorrectionDrawer({
  cells,
  open,
  onClose,
  studentsById,
  excusedCountByStudent,
  holidayDates,
  onApply,
}: BulkCorrectionDrawerProps) {
  const { draft, update, discard, isDirty } = useFormDraft<BulkForm>(
    `bulk:${cells.map((c) => `${c.studentId}|${c.date}`).join(',')}`,
  )

  const form = draft ?? INITIAL

  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>()
    for (const cell of cells) {
      if (!seen.has(cell.studentId)) seen.add(cell.studentId)
    }
    return Array.from(seen)
  }, [cells])

  const setStatus = (status: AttendanceStatus) => update({ ...form, status })
  const setReason = (reason: string) => update({ ...form, reason })
  const toggleAck = () => update({ ...form, acknowledgeWarning: !form.acknowledgeWarning })

  const addOverride = (studentId: string) => {
    if (form.overrides.some((row) => row.studentId === studentId)) return
    update({ ...form, overrides: [...form.overrides, { studentId, status: 'absent', reason: '' }] })
  }

  const removeOverride = (studentId: string) => {
    update({ ...form, overrides: form.overrides.filter((row) => row.studentId !== studentId) })
  }

  const updateOverride = (studentId: string, field: 'status' | 'reason', value: string) => {
    update({
      ...form,
      overrides: form.overrides.map((row) =>
        row.studentId === studentId ? { ...row, [field]: value } : row,
      ),
    })
  }

  if (!open) return null

  const perStudentRows: Array<{
    studentId: string
    status: AttendanceStatus
    reason: string
    holiday: boolean
    excusedCount: number
    studentStatus: 'active' | 'inactive' | 'transferred'
  }> = uniqueStudents.map((studentId) => {
    const override = form.overrides.find((row) => row.studentId === studentId)
    return {
      studentId,
      status: override?.status ?? form.status,
      reason: override?.reason ?? form.reason,
      holiday: cells.some((cell) => cell.studentId === studentId && holidayDates.has(cell.date)),
      excusedCount: excusedCountByStudent.get(studentId) ?? 0,
      studentStatus: studentsById.get(studentId)?.status ?? 'active',
    }
  })

  const issuesByStudent = perStudentRows.map((row) => ({
    studentId: row.studentId,
    issues: validateMark({
      date: cells[0]?.date ?? '',
      status: row.status,
      reason: row.reason,
      studentStatus: row.studentStatus,
      excusedCount: row.excusedCount,
      holiday: row.holiday,
    }),
  }))

  const hasErrors = issuesByStudent.some((entry) => entry.issues.length > 0)
  const hasWarning = perStudentRows.some((row) => hasExcusedWarning(row.excusedCount))

  const handleSubmit = () => {
    if (hasErrors) {
      toast.error('Fix the highlighted issues before applying')
      return
    }
    if (hasWarning && !form.acknowledgeWarning) {
      toast.error('Acknowledge the excused-day warning to continue')
      return
    }

    const changes = perStudentRows.flatMap((row) =>
      cells
        .filter((cell) => cell.studentId === row.studentId && !row.holiday)
        .map((cell) => ({
          studentId: row.studentId,
          date: cell.date,
          status: row.status,
          reason: row.reason || undefined,
        })),
    )
    onApply(changes)
    toast.success(`Applied to ${changes.length} cell(s)`)
    onClose()
  }

  const hasDirty = isDirty

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <aside
        className="w-[440px] h-full bg-surface-container-lowest shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Bulk correction</h3>
            <p className="text-sm text-on-surface-variant">{cells.length} cell(s) selected</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {hasDirty && (
            <div className="rounded-lg bg-surface-container-high p-3 text-sm text-on-surface-variant">
              Unsaved changes detected.
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half day</option>
              <option value="excused">Excused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setReason(e.target.value)}
              aria-invalid={form.reason.length > 0 && form.reason.length < 10}
              aria-describedby="reason-help"
              placeholder="Required for half-day and excused (min 10 characters)"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
            />
            <p id="reason-help" className="text-xs text-on-surface-variant mt-1">
              {form.status === 'excused' || form.status === 'half-day'
                ? 'A reason of at least 10 characters is required.'
                : 'Optional'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-on-surface">Per-student overrides</h4>
              <button
                type="button"
                onClick={() => addOverride(uniqueStudents[0])}
                className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {form.overrides.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Applying the selected status to all students.
              </p>
            ) : (
              <div className="space-y-3">
                {form.overrides.map((row) => {
                  const student = studentsById.get(row.studentId)
                  const issues =
                    issuesByStudent.find((entry) => entry.studentId === row.studentId)?.issues ?? []
                  return (
                    <div
                      key={row.studentId}
                      className="rounded-lg border border-outline-variant/30 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-on-surface">
                          {student?.name ?? row.studentId}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeOverride(row.studentId)}
                          aria-label={`Remove ${student?.name ?? row.studentId}`}
                          className="p-1 rounded hover:bg-error-container text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={row.status}
                          onChange={(e) =>
                            updateOverride(row.studentId, 'status', e.target.value)
                          }
                          className="flex-1 px-2 py-1.5 rounded border border-outline-variant bg-surface-container-lowest text-sm"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="half-day">Half day</option>
                          <option value="excused">Excused</option>
                        </select>
                        <input
                          value={row.reason}
                          onChange={(e) => updateOverride(row.studentId, 'reason', e.target.value)}
                          placeholder="Reason"
                          aria-invalid={issues.some((i) => i.field === 'reason')}
                          aria-describedby={`reason-${row.studentId}`}
                          className="flex-1 px-2 py-1.5 rounded border border-outline-variant bg-surface-container-lowest text-sm"
                        />
                      </div>
                      {issues.length > 0 && (
                        <ul id={`reason-${row.studentId}`} className="space-y-1">
                          {issues.map((issue) => (
                            <li key={issue.message} className="text-xs text-error">
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {hasWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-tertiary-container/40 p-3">
              <AlertTriangle className="w-4 h-4 text-on-tertiary-container shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Some students have more than 3 excused days this month.
                </p>
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.acknowledgeWarning}
                    onChange={toggleAck}
                  />
                  I acknowledge and want to proceed
                </label>
              </div>
            </div>
          )}
        </div>

        <footer className="px-5 py-4 border-t border-outline-variant/20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              discard()
              onClose()
            }}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={hasErrors}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim disabled:opacity-50"
          >
            Apply changes
          </button>
        </footer>
      </aside>
    </div>
  )
}
