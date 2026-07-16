export function formatMileage(mileage: number, unit: 'km' | 'mi' = 'km'): string {
  return `${mileage.toLocaleString()} ${unit}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  return `${days}d left`
}

export function formatMilesRemaining(miles: number): string {
  if (miles < 0) return `${Math.abs(miles).toLocaleString()} over`
  if (miles === 0) return 'Due now'
  return `${miles.toLocaleString()} left`
}
