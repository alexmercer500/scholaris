export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half-day'
  | 'excused'
  | 'unmarked'

export interface RosterStudent {
  id: string
  rollNumber: string
  name: string
  status: 'active' | 'inactive' | 'transferred'
}

export interface RegisterEntry {
  studentId: string
  date: string
  status: AttendanceStatus
  reason?: string
  updatedAt: string
}

export interface RegisterResponse {
  month: string
  classId: string
  holidays: string[]
  students: RosterStudent[]
  entries: RegisterEntry[]
}

export type RegisterChange = {
  studentId: string
  date: string
  status: AttendanceStatus
  reason?: string
}

export interface MarkRequest {
  classId: string
  changes: RegisterChange[]
}

export interface MarkResponse {
  applied: number
  entries: RegisterEntry[]
}

export interface ConflictResponse {
  code: 'STALE_WRITE'
  conflicts: Array<{
    studentId: string
    date: string
    serverStatus: AttendanceStatus
  }>
}

export interface ValidationErrorResponse {
  code: 'VALIDATION_FAILED'
  errors: Array<{ studentId: string; date: string; message: string }>
}

