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
      <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline-variant text-xs">
        H
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-full h-full flex items-center justify-center font-label font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
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
