import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { useBikeStore } from '../stores/bikeStore'
import type { MotorcycleDetail } from '../types'
import { formatDate, formatMileage } from '../utils/format'

export default function BikeDetailPage() {
  const { bikeId } = useParams()
  const navigate = useNavigate()
  const { deleteBike, getBikeDetail } = useBikeStore()
  const [bike, setBike] = useState<MotorcycleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadBike() {
      if (!bikeId) return
      setLoading(true)
      setError(null)
      try {
        const detail = await getBikeDetail(bikeId)
        if (!cancelled) {
          if (detail) setBike(detail)
          else setError('Bike not found.')
        }
      } catch {
        if (!cancelled) setError('Failed to load bike details.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadBike()
    return () => {
      cancelled = true
    }
  }, [bikeId, getBikeDetail])

  async function handleDelete() {
    if (!bikeId || !bike) return
    if (!window.confirm(`Remove ${bike.name}? This will hide the bike from your garage.`)) return
    await deleteBike(bikeId)
    navigate('/bikes', { replace: true })
  }

  if (loading) {
    return (
      <main className="page">
        <EmptyState icon="🏍" title="Loading bike" description="Pulling your motorcycle details from Moto Mate." />
      </main>
    )
  }

  if (error || !bike) {
    return (
      <main className="page">
        <EmptyState icon="⚠" title="Could not load bike" description={error || 'Try again from the bikes list.'} />
        <div className="button-row">
          <Link className="button" to="/bikes">
            Back to Bikes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <header className="top-bar">
        <Link className="icon-button" to="/bikes" aria-label="Back to bikes">
          ‹
        </Link>
        <Link className="icon-button" to={`/bikes/${bike.id}/edit`} aria-label="Edit bike">
          ✎
        </Link>
      </header>

      <section className="bike-hero card">
        <div>
          <p className="eyebrow">{bike.make} {bike.model} · {bike.year}</p>
          <h1 className="page-title">{bike.name}</h1>
        </div>
        <strong>{formatMileage(bike.currentMileage)}</strong>
        {bike.licensePlate ? <span>{bike.licensePlate}</span> : null}
      </section>

      <section className="stats-row" aria-label="Bike maintenance stats">
        <div className="card stat-card"><strong>{bike.overdueCount}</strong><span>Overdue</span></div>
        <div className="card stat-card"><strong>{bike.dueSoonCount}</strong><span>Due Soon</span></div>
        <div className="card stat-card"><strong>{bike.totalSchedules}</strong><span>Schedules</span></div>
      </section>

      <div className="button-row" style={{ marginBottom: 22 }}>
        <Link className="button" to={`/bikes/${bike.id}/schedules`}>
          Manage Schedules
        </Link>
      </div>

      <section>
        <h2 className="section-heading">Recent Service</h2>
        {bike.recentServiceLogs.length === 0 ? (
          <EmptyState icon="🔧" title="No service logs" description="Log maintenance to build this bike's history." />
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {bike.recentServiceLogs.map((log) => (
              <article className="bike-card card" key={log.id}>
                <div className="bike-card__body">
                  <h3>{log.templateName}</h3>
                  <p>{formatDate(log.dateOfService)} · {formatMileage(log.mileageAtService)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="button-row danger-zone">
        <button className="button button--ghost" onClick={handleDelete} type="button">
          Delete Bike
        </button>
      </div>
    </main>
  )
}
