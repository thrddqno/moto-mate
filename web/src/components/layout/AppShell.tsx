import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: '⌂', label: 'Home' },
  { to: '/bikes', icon: '🏍', label: 'Bikes' },
  { to: '/history', icon: '≋', label: 'History' },
  { to: '/settings', icon: '⚙', label: 'Settings' },
]

export function AppShell() {
  const location = useLocation()
  const showNavigation = location.pathname !== '/welcome'

  return (
    <div className="app-shell">
      <div className="app-frame">
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
