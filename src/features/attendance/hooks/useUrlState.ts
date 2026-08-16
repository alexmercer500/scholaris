import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export function useUrlState<T extends string>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const raw = searchParams.get(key)
  const value = (raw ?? defaultValue) as T

  const setValue = useCallback(
    (next: T) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (next === defaultValue) {
          params.delete(key)
        } else {
          params.set(key, next)
        }
        return params
      })
    },
    [key, defaultValue, setSearchParams],
  )

  return [value, setValue]
}
