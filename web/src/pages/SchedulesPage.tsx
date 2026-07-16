import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ScheduleEditorModal } from '../components/schedules/ScheduleEditorModal'
import { EmptyState } from '../components/ui/EmptyState'
import { useScheduleStore } from '../stores/scheduleStore'
import type { Schedule } from '../types'
import { formatDate, formatMileage } from '../utils/format'

function formatScheduleDue(nextDueMileage: number | null, nextDueDate: string | null) {
  const parts = []
  if (nextDueMileage != null) parts.push(`at ${formatMileage(nextDueMileage)}`)
  if (nextDueDate) parts.push(`on ${formatDate(nextDueDate)}`)
  return parts.length ? `Due ${parts.join(' or ')}` : 'Due date pending'
}

export default function SchedulesPage() {
  const { bikeId } = useParams()
  const { error, fetchSchedules, hasMoreMap, loadMoreSchedules, loading, scheduleMap } = useScheduleStore()
  const schedules = bikeId ? scheduleMap[bikeId] || [] : []
  const hasMore = bikeId ? Boolean(hasMoreMap[bikeId]) : false
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null | undefined>(undefined)

  useEffect(() => {
    if (bikeId) void fetchSchedules(bikeId)
  }, [bikeId, fetchSchedules])

  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Maintenance</p>
          <h1 className="page-title">SCHEDULES</h1>
        </div>
        <button className="icon-button add-plus" onClick={() => setEditingSchedule(null)} type="button" aria-label="Add schedule">
          +
        </button>
      </header>

      {loading && schedules.length === 0 ? (
        <EmptyState icon="🔧" title="Loading schedules" description="Checking maintenance intervals for this bike." />
      ) : error && schedules.length === 0 ? (
        <EmptyState icon="⚠" title="Could not load schedules" description={error} />
      ) : schedules.length === 0 ? (
        <>
          <EmptyState icon="🔧" title="No schedules yet" description="Assign maintenance tasks like oil changes or chain checks." />
          <div className="button-row">
            <button className="button" onClick={() => setEditingSchedule(null)} type="button">
              Add Schedule
            </button>
          </div>
        </>
      ) : (
        <div className="bike-list">
          {schedules.map((schedule) => (
            <button className="bike-card card card-button" key={schedule.id} onClick={() => setEditingSchedule(schedule)} type="button">
              <div className="bike-card__body">
                <h3>{schedule.templateName}</h3>
                <p>{schedule.intervalType} interval</p>
                <small>{formatScheduleDue(schedule.nextDueMileage, schedule.nextDueDate)}</small>
              </div>
              <span aria-hidden="true">›</span>
            </button>
          ))}
          {hasMore && bikeId ? (
            <button className="button button--ghost" disabled={loading} onClick={() => void loadMoreSchedules(bikeId)} type="button">
              {loading ? 'Loading...' : 'Load More Schedules'}
            </button>
          ) : null}
        </div>
      )}
      {bikeId && editingSchedule !== undefined ? (
        <ScheduleEditorModal bikeId={bikeId} schedule={editingSchedule} onClose={() => setEditingSchedule(undefined)} />
      ) : null}
    </main>
  )
}
