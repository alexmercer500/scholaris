import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ConflictResponse,
  MarkRequest,
  MarkResponse,
  RegisterResponse,
} from '../types'

async function getJson(path: string): Promise<RegisterResponse | RegisterResponse> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error('Failed to load register')
  }
  return response.json()
}

export function useRegister(classId: string, month: string) {
  return useQuery<RegisterResponse>({
    queryKey: ['attendance', classId, month],
    queryFn: () => getJson(`/api/attendance?classId=${classId}&month=${month}`),
  })
}

export function useDaySheet(classId: string, date: string) {
  return useQuery<RegisterResponse>({
    queryKey: ['attendance-day', classId, date],
    queryFn: () => getJson(`/api/attendance/date?classId=${classId}&date=${date}`),
  })
}

export function useHolidays(classId: string, month: string) {
  return useQuery<{ month: string; holidays: string[] }>({
    queryKey: ['holidays', classId, month],
    queryFn: () => getJson(`/api/attendance/holidays?classId=${classId}&month=${month}`),
  })
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation<MarkResponse, ConflictResponse, MarkRequest>({
    mutationFn: async (request: MarkRequest) => {
      const response = await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!response.ok) {
        const payload = (await response.json()) as ConflictResponse
        throw payload
      }
      return (await response.json()) as MarkResponse
    },
    onSuccess: (data, variables) => {
      const month = variables.changes[0]?.date.slice(0, 7)
      if (!month) return
      queryClient.setQueryData<RegisterResponse>(
        ['attendance', variables.classId, month],
        (old) => {
          if (!old) return old
          const applied = new Map((data.entries ?? []).map((event) => [
            `${event.studentId}|${event.date}`,
            event,
          ]))
          return {
            ...old,
            entries: old.entries.map((existing) => {
              const replacement = applied.get(`${existing.studentId}|${existing.date}`)
              return replacement ?? existing
            }),
          }
        },
      )
    },
  })
}
