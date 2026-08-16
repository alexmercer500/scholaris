import { useCallback, useReducer, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { AttendanceStatus, RegisterChange } from '../types'

interface CellValue {
  status: AttendanceStatus
  updatedAt: string
}

type State = {
  overlay: Record<string, CellValue>
  pending: string[]
  failed: RegisterChange[]
}

type Action =
  | { type: 'optimistic'; change: RegisterChange }
  | { type: 'track'; change: RegisterChange }
  | { type: 'resolve'; change: RegisterChange; version: CellValue }
  | { type: 'rollback'; change: RegisterChange }
  | { type: 'queueFailed'; change: RegisterChange }
  | { type: 'clearFailed'; changes: RegisterChange[] }

function cellKey(studentId: string, date: string) {
  return `${studentId}|${date}`
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'optimistic': {
      const key = cellKey(action.change.studentId, action.change.date)
      return {
        ...state,
        overlay: {
          ...state.overlay,
          [key]: { status: action.change.status, updatedAt: new Date().toISOString() },
        },
      }
    }
    case 'track': {
      const key = cellKey(action.change.studentId, action.change.date)
      return { ...state, pending: [...state.pending, key] }
    }
    case 'resolve': {
      const key = cellKey(action.change.studentId, action.change.date)
      const pending = state.pending.filter((item) => item !== key)
      return { ...state, pending, overlay: { ...state.overlay, [key]: action.version } }
    }
    case 'rollback': {
      const key = cellKey(action.change.studentId, action.change.date)
      const overlay = { ...state.overlay }
      delete overlay[key]
      return { ...state, pending: state.pending.filter((item) => item !== key), overlay }
    }
    case 'queueFailed': {
      const exists = state.failed.some(
        (change) =>
          change.studentId === action.change.studentId &&
          change.date === action.change.date &&
          change.status === action.change.status,
      )
      if (exists) return state
      return { ...state, failed: [...state.failed, action.change] }
    }
    case 'clearFailed': {
      const resolved = new Set(
        action.changes.map((change) => `${change.studentId}|${change.date}|${change.status}`),
      )
      return {
        ...state,
        failed: state.failed.filter(
          (change) => !resolved.has(`${change.studentId}|${change.date}|${change.status}`),
        ),
      }
    }
    default:
      return state
  }
}

export function useOptimisticMutation(classId: string) {
  const queryClient = useQueryClient()
  const [state, dispatch] = useReducer(reducer, {
    overlay: {},
    pending: [],
    failed: [],
  })
  const [flushing, setFlushing] = useState(false)

  const send = useCallback(
    async (queue: RegisterChange[]) => {
      setFlushing(true)
      try {
        const response = await fetch('/api/attendance', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classId, changes: queue }),
        })

        if (response.ok) {
          const month = queue[0]?.date.slice(0, 7)
          for (const change of queue) {
            dispatch({
              type: 'resolve',
              change,
              version: { status: change.status, updatedAt: new Date().toISOString() },
            })
          }
          dispatch({ type: 'clearFailed', changes: queue })
          if (month) {
            queryClient.invalidateQueries({ queryKey: ['attendance', classId, month] })
          }
        } else {
          for (const change of queue) {
            dispatch({ type: 'rollback', change })
            dispatch({ type: 'queueFailed', change })
          }
        }
      } finally {
        setFlushing(false)
      }
    },
    [classId, queryClient],
  )

  const markCell = useCallback(
    (studentId: string, date: string, status: AttendanceStatus) => {
      const change: RegisterChange = { studentId, date, status }
      dispatch({ type: 'optimistic', change })
      dispatch({ type: 'track', change })
      void send([change])
    },
    [send],
  )

  const retryFailed = useCallback(() => {
    if (state.failed.length === 0) return
    const queue = state.failed
    void send(queue)
  }, [state.failed, send])

  return {
    resolve: (studentId: string, date: string, status: AttendanceStatus) =>
      dispatch({
        type: 'resolve',
        change: { studentId, date, status },
        version: { status, updatedAt: new Date().toISOString() },
      }),
    getStatus: (studentId: string, date: string) => {
      const key = cellKey(studentId, date)
      return state.overlay[key]?.status
    },
    isPending: (studentId: string, date: string) => {
      const key = cellKey(studentId, date)
      return state.pending.includes(key)
    },
    markCell,
    retryFailed,
    flush: () => state.failed.length > 0 && void send(state.failed),
    flushing,
    failedCount: state.failed.length,
  }
}
