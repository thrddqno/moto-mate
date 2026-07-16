import { ArrowDownToLine, BellRing, Share2, X } from 'lucide-react'

interface InstallPromptCardProps {
  isIosInstallable: boolean
  onDismiss: () => void
  onInstall: () => Promise<boolean>
}

export function InstallPromptCard({
  isIosInstallable,
  onDismiss,
  onInstall,
}: InstallPromptCardProps) {
  return (
    <aside className="install-prompt card" aria-label="Install app prompt">
      <div className="install-prompt__glow" aria-hidden="true" />
      <div className="install-prompt__badge">
        <ArrowDownToLine size={14} aria-hidden="true" />
        Rider mode
      </div>
      <button
        aria-label="Dismiss install prompt"
        className="install-prompt__close"
        onClick={onDismiss}
        type="button"
      >
        <X size={16} aria-hidden="true" />
      </button>

      <div className="install-prompt__content">
        <p className="install-prompt__eyebrow">Install Moto Mate</p>
        <h2 className="install-prompt__title">Pin the garage to your home screen.</h2>
        <p className="install-prompt__copy">
          Open the app like a native cockpit, keep the layout chrome-free, and make reminder
          access one tap away.
        </p>
      </div>

      {isIosInstallable ? (
        <div className="install-prompt__steps" role="list" aria-label="iPhone install steps">
          <div className="install-step" role="listitem">
            <span className="install-step__number">1</span>
            <span>
              Tap <Share2 size={14} aria-hidden="true" /> <strong>Share</strong> in Safari.
            </span>
          </div>
          <div className="install-step" role="listitem">
            <span className="install-step__number">2</span>
            <span>
              Choose <strong>Add to Home Screen</strong>.
            </span>
          </div>
          <div className="install-step" role="listitem">
            <span className="install-step__number">3</span>
            <span>
              Launch it from your home screen for the full-screen PWA experience.
            </span>
          </div>
        </div>
      ) : (
        <div className="install-prompt__actions">
          <button className="button install-prompt__button" onClick={() => void onInstall()} type="button">
            Install App
          </button>
          <div className="install-prompt__note">
            <BellRing size={14} aria-hidden="true" />
            Install first so future push reminders feel native when notifications are added.
          </div>
        </div>
      )}
    </aside>
  )
}
