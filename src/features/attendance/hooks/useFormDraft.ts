import { useCallback, useEffect, useState } from 'react'

const DRAFT_KEY = 'scholaris-attendance-draft'

export type DraftData<T> = T | null

function readDraft<T>(loadKey: string): DraftData<T> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { loadKey: string; data: T }
    return parsed.loadKey === loadKey ? parsed.data : null
  } catch {
    return null
  }
}

export function useFormDraft<T>(loadKey: string) {
  const [draft, setDraft] = useState<DraftData<T>>(() => readDraft<T>(loadKey))
  const [isDirty, setIsDirty] = useState(false)

  // Reset the draft when the editing target (loadKey) changes.
  // Reading the persisted draft here is the canonical "sync to prop change"
  // case that set-state-in-effect permits with an explicit escape hatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDirty(Boolean(readDraft<T>(loadKey)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey])

  useEffect(() => {
    if (draft === null) return
    const persist = () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ loadKey, data: draft }))
    }
    persist()
    window.addEventListener('beforeunload', persist)
    const interval = window.setInterval(persist, 3000)
    return () => {
      window.removeEventListener('beforeunload', persist)
      window.clearInterval(interval)
    }
  }, [draft, loadKey])

  const update = useCallback((next: T) => {
    setDraft(next)
    setIsDirty(true)
  }, [])

  const discard = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setDraft(null)
    setIsDirty(false)
  }, [])

  const markSaved = useCallback(() => {
    setIsDirty(false)
  }, [])

  return {
    draft,
    update,
    discard,
    markSaved,
    isDirty,
    hasDraft: draft !== null,
  }
}
