import { memo } from 'react'
import type { AttendanceStatus } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../statusMeta'

interface StatusCellProps {
  status: AttendanceStatus
  onClick?: () => void
  title?: string
  pending?: boolean
  holiday?: boolean
  disabled?: boolean
}

function StatusCellBase({ status, onClick, title, pending, holiday, disabled }: StatusCellProps) {
  if (holiday) {
    return (
      <div
        title={title ?? 'Holiday — not markable'}
        aria-disabled="true"
        className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline-variant text-xs cursor-not-allowed select-none"
      >
        H
      </div>
    )
  }

  if (disabled) {
    return (
      <div
        title={title}
        aria-disabled="true"
        className="w-full h-full flex items-center justify-center bg-surface-container-low/40 cursor-not-allowed select-none"
      >
        <span className="inline-flex items-center justify-center rounded-md min-w-[22px] h-6 px-1 text-xs font-label font-bold bg-transparent text-outline-variant border border-dashed border-outline-variant/50">
          {STATUS_LABELS[status]}
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-full h-full flex items-center justify-center font-label font-bold text-sm transition-colors hover:bg-surface-container/50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
    >
      <span
        className={`inline-flex items-center justify-center rounded-md min-w-[22px] h-6 px-1 text-xs ${STATUS_COLORS[status]} ${pending ? 'opacity-50' : ''}`}
      >
        {STATUS_LABELS[status]}
      </span>
    </button>
  )
}

export const StatusCell = memo(StatusCellBase)
