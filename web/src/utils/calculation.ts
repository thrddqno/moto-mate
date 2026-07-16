import type { DashboardItem, DashboardStatus } from '../types'

export function getStatusLabel(status: DashboardStatus): string {
  switch (status) {
    case 'OVERDUE':
      return 'Overdue'
    case 'DUE_SOON':
      return 'Due Soon'
    case 'UPCOMING':
      return 'Upcoming'
  }
}

export function getProgressPercent(item: DashboardItem): number {
  if (item.status === 'OVERDUE') return 100
  if (item.status === 'DUE_SOON') {
    const miles = item.milesRemaining
    const interval = item.intervalMileage
    if (miles != null && interval && interval > 0) {
      return Math.round((1 - miles / interval) * 100)
    }

    const days = item.daysRemaining
    const intervalDays = item.intervalDays
    if (days != null && intervalDays && intervalDays > 0) {
      return Math.round((1 - days / intervalDays) * 100)
    }

    return 85
  }
  return 0
}
