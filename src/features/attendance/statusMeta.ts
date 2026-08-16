import type { AttendanceStatus } from './types'

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'P',
  absent: 'A',
  late: 'L',
  'half-day': 'HD',
  excused: 'E',
  unmarked: '·',
}

export const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-primary-fixed text-on-primary-fixed-variant',
  absent: 'bg-error-container text-on-error-container',
  late: 'bg-tertiary-container text-on-tertiary-container',
  'half-day': 'bg-secondary-container text-on-secondary-container',
  excused: 'bg-surface-container-high text-on-surface-variant',
  unmarked: 'bg-surface-container-low text-outline',
}

const CYCLE: AttendanceStatus[] = [
  'unmarked',
  'present',
  'absent',
  'late',
  'half-day',
  'excused',
]

export function nextStatus(current: AttendanceStatus): AttendanceStatus {
  const index = CYCLE.indexOf(current)
  return CYCLE[(index + 1) % CYCLE.length]
}
