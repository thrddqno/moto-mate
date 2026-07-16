import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProfileSetupPage() {
  const { profile, syncProfile, user } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = displayName.trim()
    if (!trimmedName) {
      setError('Display name is required.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await syncProfile({
        displayName: trimmedName,
        email: user?.email || undefined,
        unitPreference: profile?.unitPreference || 'km',
      })
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Failed to save your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card card" aria-labelledby="profile-title">
        <div className="hero-mark" aria-hidden="true">
          🏁
        </div>
        <p className="eyebrow">One more step</p>
        <h1 className="page-title" id="profile-title">
          PROFILE
        </h1>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Display Name</span>
            <input
              autoComplete="name"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Juan Rider"
              required
              type="text"
              value={displayName}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" disabled={loading} type="submit">
            {loading ? 'Saving...' : 'Finish Setup'}
          </button>
        </form>
      </section>
    </main>
  )
}
