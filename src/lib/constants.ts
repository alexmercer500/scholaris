/** Shared domain constants used across features. */

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const

export type Day = (typeof DAYS)[number]

/** Period numbers 1–8. */
export const PERIODS: readonly number[] = Array.from({ length: 8 }, (_, i) => i + 1)

/** The four attendance statuses used everywhere. */
export const ATTENDANCE_STATUSES = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUSES)[keyof typeof ATTENDANCE_STATUSES]

/** Default threshold for marking a student a defaulter. */
export const DEFAULTER_THRESHOLD = 75

