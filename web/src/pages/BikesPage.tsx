import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { useBikeStore } from '../stores/bikeStore'
import { formatMileage } from '../utils/format'

export default function BikesPage() {
  const { bikes, error, fetchBikes, hasMore, loadMoreBikes, loading } = useBikeStore()

  useEffect(() => {
    void fetchBikes()
  }, [fetchBikes])

  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Garage</p>
          <h1 className="page-title">MY BIKES</h1>
        </div>
        <Link className="icon-button" to="/bikes/new" aria-label="Add bike">
          +
        </Link>
      </header>
      {loading && bikes.length === 0 ? (
        <EmptyState icon="🏍" title="Loading bikes" description="Checking your Moto Mate garage." />
      ) : error && bikes.length === 0 ? (
        <>
          <EmptyState icon="⚠" title="Could not load bikes" description={error} />
          <div className="button-row">
            <button className="button" onClick={() => void fetchBikes()} type="button">
              Try Again
            </button>
          </div>
        </>
      ) : bikes.length === 0 ? (
        <>
          <EmptyState icon="🏍" title="No bikes yet" description="Add a motorcycle to start tracking its maintenance schedule." />
          <div className="button-row">
            <Link className="button" to="/bikes/new">
              Add Bike
            </Link>
          </div>
        </>
      ) : (
        <div className="bike-list">
          {bikes.map((bike) => (
            <Link className="bike-card card" key={bike.id} to={`/bikes/${bike.id}`}>
              <span className="bike-avatar" aria-hidden="true">🏍</span>
              <div className="bike-card__body">
                <h3>{bike.name}</h3>
                <p>{bike.make} {bike.model} · {bike.year}</p>
                <small>{formatMileage(bike.currentMileage)}</small>
              </div>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
          {hasMore ? (
            <button className="button button--ghost" disabled={loading} onClick={() => void loadMoreBikes()} type="button">
              {loading ? 'Loading...' : 'Load More Bikes'}
            </button>
          ) : null}
        </div>
      )}
    </main>
  )
}
