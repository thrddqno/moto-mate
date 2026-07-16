import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt'

export default function SettingsPage() {
  const { profile, signOut, user } = useAuth()
  const navigate = useNavigate()
  const { canPromptInstall, isInstallUnsupported, isInstalled, isIosInstallable, promptInstall } =
    usePwaInstallPrompt()

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
        {!isInstalled ? (
          <section className="settings-install card" aria-labelledby="install-title">
            <div className="settings-install__header">
              <div>
                <p className="settings-install__eyebrow">Install</p>
                <h2 className="settings-install__title" id="install-title">
                  Keep Moto Mate on deck.
                </h2>
              </div>
              <span className="settings-install__status">PWA</span>
            </div>

            <p className="settings-install__copy">
              Pin the app to your home screen for a cleaner, faster rider cockpit.
            </p>

            {canPromptInstall ? (
              <button className="button" onClick={() => void promptInstall()} type="button">
                Install App
              </button>
            ) : null}

            {isIosInstallable ? (
              <div className="settings-install__steps" role="list" aria-label="iPhone install steps">
                <div className="settings-install__step" role="listitem">
                  <strong>1</strong>
                  <span>Tap Share in Safari.</span>
                </div>
                <div className="settings-install__step" role="listitem">
                  <strong>2</strong>
                  <span>Choose Add to Home Screen.</span>
                </div>
                <div className="settings-install__step" role="listitem">
                  <strong>3</strong>
                  <span>Launch Moto Mate from your home screen.</span>
                </div>
              </div>
            ) : null}

            {isInstallUnsupported ? (
              <p className="settings-install__unsupported">
                This browser does not currently expose an install prompt for Moto Mate. Try a
                Chromium-based browser or Safari on iPhone.
              </p>
            ) : null}
          </section>
        ) : null}
        <button className="button button--ghost" onClick={handleSignOut} type="button">
          Sign Out
        </button>
      </div>
    </main>
  )
}
