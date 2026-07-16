import { EmptyState } from '../components/ui/EmptyState'
import { StatusSection } from '../components/ui/StatusSection'
import type { DashboardResponse } from '../types'

const placeholderDashboard: DashboardResponse = {
  totalBikes: 0,
  totalActiveSchedules: 0,
  overdue: [],
  dueSoon: [],
  upcoming: [],
}

export default function DashboardPage() {
  const dashboard = placeholderDashboard

  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="brand-title">MOTO MATE</h1>
        </div>
        <button className="icon-button" type="button" aria-label="Notification settings">
          🔔
        </button>
      </header>

      <section className="summary-card card" aria-label="Maintenance summary">
        <div className="summary-grid">
          <div className="summary-metric">
            <strong>{dashboard.totalActiveSchedules}</strong>
            <span>Schedules</span>
          </div>
          <div className="summary-metric">
            <strong style={{ color: 'var(--color-red)' }}>{dashboard.overdue.length}</strong>
            <span>Overdue</span>
          </div>
          <div className="summary-metric">
            <strong style={{ color: 'var(--color-amber)' }}>{dashboard.dueSoon.length}</strong>
            <span>Due Soon</span>
          </div>
        </div>
      </section>

      {dashboard.totalBikes === 0 ? (
        <div style={{ marginTop: 24 }}>
          <EmptyState
            icon="🏍"
            title="Add your first bike"
            description="Once a motorcycle is added, due maintenance will appear here."
          />
        </div>
      ) : (
        <>
          <StatusSection title="Overdue" status="OVERDUE" items={dashboard.overdue} />
          <StatusSection title="Due Soon" status="DUE_SOON" items={dashboard.dueSoon} />
          <StatusSection title="Upcoming" status="UPCOMING" items={dashboard.upcoming} />
        </>
      )}
    </main>
  )
}
