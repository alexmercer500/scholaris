import type {
  AttendanceStatus,
  RegisterEntry,
  RegisterResponse,
  RosterStudent,
} from '@features/attendance/types'

const CLASS_IDS = ['g10a', 'g10b', 'g11a', 'g11b', 'g12a', 'g12b']

const ROSTER: Record<string, RosterStudent[]> = Object.fromEntries(
  CLASS_IDS.map((classId) => {
    const grade = classId.slice(1, 3)
    const section = classId.slice(3).toUpperCase()
    const count = 200
    const students: RosterStudent[] = Array.from({ length: count }, (_, i) => ({
      id: `${classId}-s${i + 1}`,
      rollNumber: `${grade}${section}-${String(i + 1).padStart(3, '0')}`,
      name: `Student ${classId.toUpperCase()} ${i + 1}`,
      status: i % 12 === 0 ? 'inactive' : i % 9 === 0 ? 'transferred' : 'active',
    }))
    return [classId, students]
  }),
)

function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function isoDate(month: string, day: number): string {
  const [y, m] = month.split('-')
  return `${y}-${m}-${String(day).padStart(2, '0')}`
}

function statusFor(index: number): AttendanceStatus {
  const roll = index % 100
  if (roll < 82) return 'present'
  if (roll < 88) return 'absent'
  if (roll < 93) return 'late'
  if (roll < 96) return 'half-day'
  return 'excused'
}

function registerFor(classId: string, month: string): RegisterResponse {
  const students = ROSTER[classId]
  const totalDays = daysInMonth(month)
  const holidays: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(`${month}-${String(d).padStart(2, '0')}T00:00:00`)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      holidays.push(isoDate(month, d))
    }
  }
  const entries: RegisterEntry[] = []
  for (let d = 1; d <= totalDays; d++) {
    const date = isoDate(month, d)
    if (holidays.includes(date)) continue

    const targetDate = new Date(`${date}T00:00:00`)
    if (targetDate > today) continue

    for (const student of students) {
      const index = Number(student.id.split('-s')[1]) + d
      entries.push({
        studentId: student.id,
        date,
        status: statusFor(index),
        updatedAt: '2026-08-11T09:00:00.000Z',
      })
    }
  }
  return { month, classId, holidays, students, entries }
}

const registerCache: Record<string, RegisterResponse> = {}

export function getRegister(classId: string, month: string): RegisterResponse {
  const key = `${classId}|${month}`
  if (!registerCache[key]) {
    registerCache[key] = registerFor(classId, month)
  }
  return registerCache[key]
}

export function applyChanges(
  classId: string,
  changes: Array<{
    studentId: string
    date: string
    status: AttendanceStatus
    reason?: string
  }>,
): { applied: number } {
  for (const change of changes) {
    const month = change.date.slice(0, 7)
    const key = `${classId}|${month}`
    if (!registerCache[key]) {
      registerCache[key] = registerFor(classId, month)
    }
    const entry = registerCache[key].entries.find(
      (e) => e.studentId === change.studentId && e.date === change.date,
    )
    if (entry) {
      entry.status = change.status
      if (change.reason !== undefined) entry.reason = change.reason
      entry.updatedAt = new Date().toISOString()
    }
  }
  return { applied: changes.length }
}

export function getClassOptions() {
  return CLASS_IDS.map((id) => ({ id, label: id.toUpperCase() }))
}
