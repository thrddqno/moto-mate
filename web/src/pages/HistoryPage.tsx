import { EmptyState } from '../components/ui/EmptyState'

export default function HistoryPage() {
  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Service records</p>
          <h1 className="page-title">HISTORY</h1>
        </div>
      </header>
      <EmptyState icon="🔧" title="No service logs" description="Completed maintenance entries will appear here." />
    </main>
  )
}
