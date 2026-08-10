
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${get('day')} ${get('month').slice(0, 3)} ${get('year')}`
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
