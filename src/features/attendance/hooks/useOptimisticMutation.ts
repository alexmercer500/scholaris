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
  | { type: 'fail'; change: RegisterChange }
  | { type: 'queueFailed'; change: RegisterChange }

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
    case 'fail': {
      const key = cellKey(action.change.studentId, action.change.date)
      return { ...state, pending: state.pending.filter((item) => item !== key) }
    }
    case 'queueFailed': {
      return { ...state, failed: [...state.failed, action.change] }
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
          if (month) {
            queryClient.invalidateQueries({ queryKey: ['attendance', classId, month] })
          }
        } else {
          for (const change of queue) {
            dispatch({ type: 'fail', change })
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
    dispatch({ type: 'fail', change: queue[0] })
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
