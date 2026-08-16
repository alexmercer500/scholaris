import type { AttendanceStatus } from '../types'

export interface BulkValidationInput {
  date: string
  status: AttendanceStatus
  reason?: string
  studentStatus: 'active' | 'inactive' | 'transferred'
  excusedCount: number
  holiday: boolean
}

export interface ValidationIssue {
  field: string
  message: string
}

export function validateMark(input: BulkValidationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(`${input.date}T00:00:00`)
  if (targetDate > today) {
    issues.push({ field: 'date', message: 'Cannot mark future dates' })
  }

  if (input.holiday) {
    issues.push({ field: 'date', message: 'This date is a holiday and cannot be marked' })
  }

  if (input.studentStatus === 'transferred' || input.studentStatus === 'inactive') {
    if (input.status === 'present') {
      issues.push({ field: 'status', message: 'This student cannot be marked present' })
    }
  }

  if (input.status === 'half-day' || input.status === 'excused') {
    if (!input.reason || input.reason.trim().length < 10) {
      issues.push({
        field: 'reason',
        message: `${input.status} requires a reason of at least 10 characters`,
      })
    }
  }

  return issues
}

const EXCUSED_LIMIT = 3

export function hasExcusedWarning(excusedCount: number): boolean {
  return excusedCount > EXCUSED_LIMIT
}
