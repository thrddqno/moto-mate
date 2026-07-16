import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogServiceModal } from '../components/actions/LogServiceModal'
import { QuickActionFab } from '../components/actions/QuickActionFab'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusSection } from '../components/ui/StatusSection'
import { useAuth } from '../context/AuthContext'
import { useDashboardStore } from '../stores/dashboardStore'
import type { DashboardItem } from '../types'

function sortUpcomingByMileageLeft(items: DashboardItem[]) {
  return [...items].sort((a, b) => {
    if (a.milesRemaining != null && b.milesRemaining != null) {
      return a.milesRemaining - b.milesRemaining
    }

    if (a.milesRemaining != null) return -1
    if (b.milesRemaining != null) return 1

    if (a.daysRemaining != null && b.daysRemaining != null) {
      return a.daysRemaining - b.daysRemaining
    }

    return 0
  })
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const { data: dashboard, error, fetchDashboard, lastFetched, loading } = useDashboardStore()
  const [selectedServiceItem, setSelectedServiceItem] = useState<DashboardItem | null>(null)
  const displayName = profile?.displayName || user?.displayName

  useEffect(() => {
    if (!lastFetched) {
      void fetchDashboard()
    }
  }, [fetchDashboard, lastFetched])

  const totalBikes = dashboard?.totalBikes ?? 0
  const totalActiveSchedules = dashboard?.totalActiveSchedules ?? 0
  const overdue = dashboard?.overdue ?? []
  const dueSoon = dashboard?.dueSoon ?? []
  const upcoming = sortUpcomingByMileageLeft(dashboard?.upcoming ?? [])

  return (
    <main className="page dashboard-page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">{displayName ? `Ready, ${displayName}` : 'Dashboard'}</p>
          <h1 className="brand-title">MOTO MATE</h1>
        </div>
        <button className="icon-button" onClick={() => void fetchDashboard()} type="button" aria-label="Refresh dashboard">
          ↻
        </button>
      </header>

      <section className="summary-card card" aria-label="Maintenance summary">
        <div className="summary-grid">
          <div className="summary-metric">
            <strong>{totalActiveSchedules}</strong>
            <span>Schedules</span>
          </div>
          <div className="summary-metric">
            <strong style={{ color: 'var(--color-red)' }}>{overdue.length}</strong>
            <span>Overdue</span>
          </div>
          <div className="summary-metric">
            <strong style={{ color: 'var(--color-amber)' }}>{dueSoon.length}</strong>
            <span>Due Soon</span>
          </div>
        </div>
      </section>

      <section className="dashboard-entries" aria-label="Maintenance entries">
        {loading && !dashboard ? (
          <div style={{ marginTop: 24 }}>
            <EmptyState icon="🏍" title="Loading dashboard" description="Checking all bikes for due maintenance." />
          </div>
        ) : error && !dashboard ? (
          <div style={{ marginTop: 24 }}>
            <EmptyState icon="⚠" title="Could not load dashboard" description={error} />
            <div className="button-row">
              <button className="button" onClick={() => void fetchDashboard()} type="button">
                Try Again
              </button>
            </div>
          </div>
        ) : totalBikes === 0 ? (
          <div style={{ marginTop: 24 }}>
            <EmptyState
              icon="🏍"
              title="Add your first bike"
              description="Once a motorcycle is added, due maintenance will appear here."
            />
            <div className="button-row">
              <Link className="button" to="/bikes/new">
                Add Bike
              </Link>
            </div>
          </div>
        ) : overdue.length === 0 && dueSoon.length === 0 && upcoming.length === 0 ? (
          <div style={{ marginTop: 24 }}>
            <EmptyState icon="✅" title="All caught up" description="No maintenance items are due right now." />
          </div>
        ) : (
          <>
            <StatusSection title="Overdue" status="OVERDUE" items={overdue} />
            <StatusSection title="Due Soon" status="DUE_SOON" items={dueSoon} />
            <StatusSection title="Upcoming" status="UPCOMING" items={upcoming} onItemClick={setSelectedServiceItem} />
          </>
        )}
      </section>
      <QuickActionFab />
      <LogServiceModal
        bikeId={selectedServiceItem?.motorcycleId ?? null}
        initialScheduleId={selectedServiceItem?.scheduleId}
        key={selectedServiceItem?.scheduleId ?? 'no-selection'}
        open={selectedServiceItem != null}
        onClose={() => setSelectedServiceItem(null)}
      />
    </main>
  )
}
