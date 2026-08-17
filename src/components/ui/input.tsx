import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon rendered inside the field. */
  icon?: ReactNode
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, error, id, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-on-surface"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'block w-full py-3 border rounded-[12px] text-on-surface font-body',
            'placeholder:text-outline-variant transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            icon ? 'pl-10 pr-3' : 'px-3',
            error
              ? 'border-error focus:ring-error focus:border-error'
              : 'border-outline-variant bg-surface-container-lowest',
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-sm text-error font-body">
          {error}
        </p>
      )}
    </div>
  ),
)

Input.displayName = 'Input'
