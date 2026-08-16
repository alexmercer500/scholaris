import { delay, http, HttpResponse } from 'msw'
import { applyChanges, getRegister } from '@mocks/db/attendance'
import type { AttendanceStatus } from '@features/attendance/types'

function randomLatency(): number {
  return 300 + Math.floor(Math.random() * 900)
}

function maybeFailMutation(): boolean {
  return Math.random() < 0.15
}

export const attendanceHandlers = [
  http.get('/api/attendance', async ({ request }) => {
    await delay(randomLatency())

    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const month = url.searchParams.get('month')

    if (!classId || !month) {
      return HttpResponse.json(
        { message: 'classId and month are required' },
        { status: 400 },
      )
    }

    const register = getRegister(classId, month)
    if (register.students.length === 0) {
      return HttpResponse.json({ message: 'Class not found' }, { status: 404 })
    }

    return HttpResponse.json(register)
  }),

  http.patch('/api/attendance', async ({ request }) => {
    await delay(randomLatency())

    if (maybeFailMutation()) {
      return HttpResponse.json(
        { message: 'Upstream service unavailable' },
        { status: 503 },
      )
    }

    const body = (await request.json()) as {
      classId: string
      changes: Array<{
        studentId: string
        date: string
        status: AttendanceStatus
        reason?: string
      }>
    }

    const result = applyChanges(body.classId, body.changes)
    const register = getRegister(body.classId, body.changes[0]?.date.slice(0, 7) ?? '')

    return HttpResponse.json({
      applied: result.applied,
      entries: register.entries,
    })
  }),

  http.get('/api/attendance/date', async ({ request }) => {
    await delay(randomLatency())

    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const date = url.searchParams.get('date')

    if (!classId || !date) {
      return HttpResponse.json(
        { message: 'classId and date are required' },
        { status: 400 },
      )
    }

    const month = date.slice(0, 7)
    const register = getRegister(classId, month)
    const dayEntries = register.entries.filter((entry) => entry.date === date)

    return HttpResponse.json({
      date,
      classId,
      holidays: register.holidays,
      students: register.students,
      entries: dayEntries,
    })
  }),

  http.get('/api/attendance/holidays', async ({ request }) => {
    await delay(randomLatency())

    const url = new URL(request.url)
    const month = url.searchParams.get('month')
    const classId = url.searchParams.get('classId') ?? 'g11a'

    if (!month) {
      return HttpResponse.json({ message: 'month is required' }, { status: 400 })
    }

    const register = getRegister(classId, month)
    return HttpResponse.json({ month, holidays: register.holidays })
  }),

  http.get('/api/classes', async () => {
    await delay(randomLatency())
    const { getClassOptions } = await import('@mocks/db/attendance')
    return HttpResponse.json(getClassOptions())
  }),
]

