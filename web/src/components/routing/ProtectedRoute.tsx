import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="page auth-page">
        <div className="auth-card card">
          <div className="hero-mark" aria-hidden="true">
            🏍
          </div>
          <p className="eyebrow">Checking session</p>
          <h1 className="page-title">MOTO MATE</h1>
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />
  }

  return children
}
