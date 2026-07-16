import { Link } from 'react-router-dom'

export default function WelcomePage() {
  return (
    <main className="page hero-panel">
      <span className="pwa-badge">PWA ready shell</span>
      <div className="hero-mark" aria-hidden="true">
        🏍
      </div>
      <div>
        <h1 className="hero-title">MOTO MATE</h1>
        <p className="hero-copy">
          A mobile-first maintenance cockpit for riders who track service by mileage, date, or both.
        </p>
      </div>
      <div className="button-row">
        <Link className="button" to="/sign-in">
          Sign In
        </Link>
        <Link className="button button--ghost" to="/sign-up">
          Create Account
        </Link>
      </div>
    </main>
  )
}
