import { History, Home, Settings } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { InstallPromptCard } from '../pwa/InstallPromptCard'
import { NavigationAudit } from '../routing/NavigationAudit'
import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt'

const navItems = [
  { to: '/dashboard', icon: <Home aria-hidden="true" size={21} />, label: 'Home' },
  { to: '/bikes', icon: '🏍', label: 'Bikes' },
  { to: '/history', icon: <History aria-hidden="true" size={21} />, label: 'History' },
  { to: '/settings', icon: <Settings aria-hidden="true" size={21} />, label: 'Settings' },
]

export function AppShell() {
  const location = useLocation()
  const showNavigation = !['/welcome', '/sign-in', '/sign-up', '/profile-setup'].includes(location.pathname)
  const { canPromptInstall, dismissInstallPrompt, isIosInstallable, promptInstall } =
    usePwaInstallPrompt()
  const shouldShowInstallPrompt = canPromptInstall || isIosInstallable

  return (
    <div className="app-shell">
      <div className="app-frame">
        <NavigationAudit />
        {shouldShowInstallPrompt ? (
          <div className="app-banner-stack">
            <InstallPromptCard
              isIosInstallable={isIosInstallable}
              onDismiss={dismissInstallPrompt}
              onInstall={promptInstall}
            />
          </div>
        ) : null}
        <Outlet />
      </div>
      {showNavigation ? (
        <nav className="bottom-nav" aria-label="Primary navigation">
          <div className="bottom-nav__inner">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
