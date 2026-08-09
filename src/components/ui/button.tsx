import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-on-primary-fixed-variant focus-visible:ring-primary',
  secondary:
    'bg-surface text-primary border border-outline-variant hover:bg-surface-container',
  ghost: 'text-primary hover:bg-surface-container',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-2 px-3 text-sm',
  md: 'py-3 px-4 text-base',
  lg: 'py-3.5 px-5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[12px] font-label font-semibold',
        'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
