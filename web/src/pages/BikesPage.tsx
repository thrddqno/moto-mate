import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'

export default function BikesPage() {
  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Garage</p>
          <h1 className="page-title">MY BIKES</h1>
        </div>
        <button className="icon-button" type="button" aria-label="Add bike">
          +
        </button>
      </header>
      <EmptyState icon="🏍" title="No bikes yet" description="Add a motorcycle to start tracking its maintenance schedule." />
      <div className="button-row">
        <Link className="button" to="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
