import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { useBikeStore } from '../stores/bikeStore'
import { useServiceLogStore } from '../stores/serviceLogStore'
import { formatDate, formatMileage } from '../utils/format'

export default function HistoryPage() {
  const { bikes, fetchBikes } = useBikeStore()
  const { error, fetchLogs, hasMore, loadMoreLogs, loading, logs } = useServiceLogStore()
  const [selectedBikeId, setSelectedBikeId] = useState('')

  useEffect(() => {
    void fetchBikes()
  }, [fetchBikes])

  useEffect(() => {
    void fetchLogs(selectedBikeId || null)
  }, [fetchLogs, selectedBikeId])

  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Service records</p>
          <h1 className="page-title">HISTORY</h1>
        </div>
      </header>

      <label className="filter-control">
        <span>Bike</span>
        <select value={selectedBikeId} onChange={(event) => setSelectedBikeId(event.target.value)}>
          <option value="">All bikes</option>
          {bikes.map((bike) => (
            <option key={bike.id} value={bike.id}>{bike.name}</option>
          ))}
        </select>
      </label>

      {bikes.length === 0 && !loading ? (
        <>
          <EmptyState icon="🏍" title="No bikes yet" description="Add a motorcycle before logging maintenance history." />
          <div className="button-row">
            <Link className="button" to="/bikes/new">Add Bike</Link>
          </div>
        </>
      ) : loading && logs.length === 0 ? (
        <EmptyState icon="🔧" title="Loading history" description="Fetching service records." />
      ) : error && logs.length === 0 ? (
        <>
          <EmptyState icon="⚠" title="Could not load history" description={error} />
          <div className="button-row">
            <button className="button" onClick={() => void fetchLogs(selectedBikeId || null)} type="button">Try Again</button>
          </div>
        </>
      ) : logs.length === 0 ? (
        <EmptyState icon="🔧" title="No service logs" description="Completed maintenance entries will appear here." />
      ) : (
        <div className="history-list">
          {logs.map((log) => {
            const bike = bikes.find((item) => item.id === log.motorcycleId)
            return (
              <article className="history-card card" key={log.id}>
                <div>
                  <h2>{log.templateName}</h2>
                  <p>{bike?.name || 'Motorcycle'} · {formatDate(log.dateOfService)}</p>
                  <small>{formatMileage(log.mileageAtService)}</small>
                  {log.notes ? <p className="history-notes">{log.notes}</p> : null}
                </div>
              </article>
            )
          })}
          {hasMore ? (
            <button className="button button--ghost" disabled={loading} onClick={() => void loadMoreLogs(selectedBikeId || null)} type="button">
              {loading ? 'Loading...' : 'Load More History'}
            </button>
          ) : null}
        </div>
      )}
    </main>
  )
}
