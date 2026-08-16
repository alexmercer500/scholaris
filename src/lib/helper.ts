import type { StudentRow } from "@features/students/column/column"

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function isAtRisk(student: StudentRow): boolean {
  return student.attendancePercentage < 75
}