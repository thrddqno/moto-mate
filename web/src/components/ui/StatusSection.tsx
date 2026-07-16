import type { DashboardItem, DashboardStatus } from '../../types'
import { formatDaysRemaining, formatMilesRemaining } from '../../utils/format'

interface StatusSectionProps {
  title: string
  status: DashboardStatus
  items: DashboardItem[]
  onItemClick?: (item: DashboardItem) => void
}

const statusColor: Record<DashboardStatus, string> = {
  OVERDUE: 'var(--color-red)',
  DUE_SOON: 'var(--color-amber)',
  UPCOMING: 'var(--color-green)',
}

export function StatusSection({ title, status, items, onItemClick }: StatusSectionProps) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby={`${status}-heading`}>
      <h2 className="section-heading" id={`${status}-heading`}>
        <span className="status-dot" style={{ color: statusColor[status] }} aria-hidden="true" />
        {title}
        <span>{items.length}</span>
      </h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((item) => {
          const content = (
            <>
              <span className="status-dot" style={{ color: statusColor[status] }} aria-hidden="true" />
              <div className="task-card__body">
                <h3>{item.templateName}</h3>
                <p>{item.motorcycleName}</p>
                {item.milesRemaining != null ? <small>{formatMilesRemaining(item.milesRemaining)}</small> : null}
                {item.daysRemaining != null ? <small>{formatDaysRemaining(item.daysRemaining)}</small> : null}
              </div>
              <span aria-hidden="true">›</span>
            </>
          )

          return onItemClick ? (
            <button className="task-card card card-button" key={item.scheduleId} onClick={() => onItemClick(item)} type="button">
              {content}
            </button>
          ) : (
            <article className="task-card card" key={item.scheduleId}>
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}
