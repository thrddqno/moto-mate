import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { useScheduleStore } from '../stores/scheduleStore'
import { formatDate, formatMileage } from '../utils/format'

function formatScheduleDue(nextDueMileage: number | null, nextDueDate: string | null) {
  const parts = []
  if (nextDueMileage != null) parts.push(`at ${formatMileage(nextDueMileage)}`)
  if (nextDueDate) parts.push(`on ${formatDate(nextDueDate)}`)
  return parts.length ? `Due ${parts.join(' or ')}` : 'Due date pending'
}

export default function SchedulesPage() {
  const { bikeId } = useParams()
  const { deleteSchedule, error, fetchSchedules, hasMoreMap, loadMoreSchedules, loading, scheduleMap } = useScheduleStore()
  const schedules = bikeId ? scheduleMap[bikeId] || [] : []
  const hasMore = bikeId ? Boolean(hasMoreMap[bikeId]) : false

  useEffect(() => {
    if (bikeId) void fetchSchedules(bikeId)
  }, [bikeId, fetchSchedules])

  async function handleDelete(scheduleId: string, name: string) {
    if (!bikeId) return
    if (!window.confirm(`Delete ${name} schedule? Service logs remain in history.`)) return
    await deleteSchedule(bikeId, scheduleId)
  }

  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Maintenance</p>
          <h1 className="page-title">SCHEDULES</h1>
        </div>
        <Link className="icon-button" to={bikeId ? `/bikes/${bikeId}/schedules/new` : '/bikes'} aria-label="Add schedule">
          +
        </Link>
      </header>

      {loading && schedules.length === 0 ? (
        <EmptyState icon="🔧" title="Loading schedules" description="Checking maintenance intervals for this bike." />
      ) : error && schedules.length === 0 ? (
        <EmptyState icon="⚠" title="Could not load schedules" description={error} />
      ) : schedules.length === 0 ? (
        <>
          <EmptyState icon="🔧" title="No schedules yet" description="Assign maintenance tasks like oil changes or chain checks." />
          <div className="button-row">
            <Link className="button" to={bikeId ? `/bikes/${bikeId}/schedules/new` : '/bikes'}>
              Add Schedule
            </Link>
          </div>
        </>
      ) : (
        <div className="bike-list">
          {schedules.map((schedule) => (
            <article className="bike-card card" key={schedule.id}>
              <div className="bike-card__body">
                <h3>{schedule.templateName}</h3>
                <p>{schedule.intervalType} interval</p>
                <small>{formatScheduleDue(schedule.nextDueMileage, schedule.nextDueDate)}</small>
              </div>
              <div className="card-actions">
                <Link to={`/bikes/${bikeId}/schedules/${schedule.id}/edit`}>Edit</Link>
                <button onClick={() => void handleDelete(schedule.id, schedule.templateName)} type="button">Delete</button>
              </div>
            </article>
          ))}
          {hasMore && bikeId ? (
            <button className="button button--ghost" disabled={loading} onClick={() => void loadMoreSchedules(bikeId)} type="button">
              {loading ? 'Loading...' : 'Load More Schedules'}
            </button>
          ) : null}
        </div>
      )}
    </main>
  )
}
