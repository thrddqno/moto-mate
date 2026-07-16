export default function SettingsPage() {
  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1 className="page-title">SETTINGS</h1>
        </div>
      </header>
      <section className="card summary-card">
        <h2 className="section-heading" style={{ marginTop: 0 }}>
          PWA STATUS
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
          This web target is configured as the replacement mobile-first PWA. Firebase auth, backend data,
          and push registration are migrated in the next tickets.
        </p>
      </section>
    </main>
  )
}
