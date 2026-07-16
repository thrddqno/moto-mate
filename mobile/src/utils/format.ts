export function formatMileage(mileage: number, unit: 'km' | 'mi' = 'km'): string {
  return `${mileage.toLocaleString()} ${unit}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  });
}

export function daysFromNow(dateString: string): number {
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.ceil((then - now) / (1000 * 60 * 60 * 24));
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `${days}d left`;
}

export function formatMilesRemaining(miles: number): string {
  if (miles < 0) return `${Math.abs(miles).toLocaleString()} over`;
  if (miles === 0) return 'Due now';
  return `${miles.toLocaleString()} left`;
}
