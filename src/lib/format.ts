import { format, parseISO } from 'date-fns'

/** Format a date string/Date into a human-readable label (e.g. "12 Sep 2024"). */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, 'd MMM yyyy')
}

/** Format a number as a percentage without excessive decimals. */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

/** Format a number with thousand separators. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

/** Capitalise the first letter of a string. */
export function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}
