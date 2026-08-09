/** Core domain models. */

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface Student {
  id: string
  rollNumber: string
  name: string
  avatarUrl?: string
  classId: string
  section: string
  guardian: string
  contact: string
  status: 'active' | 'inactive' | 'transferred'
  enrolmentDate: string
  attendancePercentage: number
}

export interface Teacher {
  id: string
  employeeId: string
  name: string
  avatarUrl?: string
  subjects: string[]
  classIds: string[]
  periodsPerWeek: number
  contact: string
  status: 'active' | 'inactive' | 'on-leave'
}

export interface ClassInfo {
  id: string
  name: string
  section: string
  classTeacherId: string
  studentCount: number
  roomId: string
}

export interface Subject {
  id: string
  code: string
  name: string
  department: string
  weeklyPeriods: number
  teacherIds: string[]
}

export interface Room {
  id: string
  code: string
  capacity: number
  type: 'classroom' | 'lab' | 'hall'
}

export interface TimetableSlot {
  id: string
  day: string
  period: number
  classId: string
  teacherId: string
  subjectId: string
  roomId: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
}
