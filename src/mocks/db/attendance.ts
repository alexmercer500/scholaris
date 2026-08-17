import type {
  AttendanceStatus,
  RegisterEntry,
  RegisterResponse,
  RosterStudent,
} from '@features/attendance/types'
import { demoStudents } from './students'

const CLASS_IDS = ['g10a', 'g10b', 'g11a', 'g11b', 'g12a', 'g12b']

// Build ROSTER with same students and names as demoStudents for complete consistency
function buildRoster(): Record<string, RosterStudent[]> {
  return Object.fromEntries(
    CLASS_IDS.map((classId) => {
      // Get the class index (0-5) corresponding to this classId
      const classIndex = CLASS_IDS.indexOf(classId)

      // Distribute the 100 demoStudents across 6 classes using modulo matching
      // demoStudents[i] goes to class (i % 6)
      const students: RosterStudent[] = demoStudents
        .filter((_, i) => i % 6 === classIndex)
        .map((student) => ({
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.name,
          status: student.status as RosterStudent['status'],
        }))

      return [classId, students]
    }),
  )
}

const ROSTER = buildRoster()

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

    // Today is left unmarked so teachers start the day with an empty column.
    const targetDate = new Date(`${date}T00:00:00`)
    if (targetDate >= today) continue

    for (const student of students) {
      // Extract student number from ID (s123 -> 123)
      const studentNum = Number(student.id.slice(1))
      entries.push({
        studentId: student.id,
        date,
        status: statusFor(studentNum + d),
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
    } else {
      // Unmarked days (today included) have no seeded entry, so create one.
      registerCache[key].entries.push({
        studentId: change.studentId,
        date: change.date,
        status: change.status,
        reason: change.reason,
        updatedAt: new Date().toISOString(),
      })
    }
  }
  return { applied: changes.length }
}

export function getClassOptions() {
  return CLASS_IDS.map((id) => ({ id, label: id.toUpperCase() }))
}
