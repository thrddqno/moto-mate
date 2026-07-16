import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { profile, signOut, user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/welcome', { replace: true })
  }

  return (
    <main className="page">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1 className="page-title">SETTINGS</h1>
        </div>
      </header>
      <div className="settings-list">
        <section className="settings-row card">
          <div>
            <strong>{profile?.displayName || user?.displayName || 'Moto Mate Rider'}</strong>
            <span>{profile?.email || user?.email || 'Signed in with Firebase'}</span>
          </div>
        </section>
        <section className="settings-row card">
          <div>
            <strong>Units</strong>
            <span>{profile?.unitPreference || 'km'}</span>
          </div>
        </section>
        <button className="button button--ghost" onClick={handleSignOut} type="button">
          Sign Out
        </button>
      </div>
    </main>
  )
}
