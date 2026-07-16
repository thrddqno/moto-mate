import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function authErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code === 'auth/email-already-in-use') return 'That email is already registered.'
  if (code === 'auth/invalid-email') return 'Enter a valid email address.'
  if (code === 'auth/weak-password') return 'Use at least 6 characters for your password.'
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was closed before it finished.'
  return 'Something went wrong. Please try again.'
}

export default function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password)
      navigate('/profile-setup', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/profile-setup', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card card" aria-labelledby="signup-title">
        <div className="hero-mark" aria-hidden="true">
          🏍
        </div>
        <p className="eyebrow">Start tracking</p>
        <h1 className="page-title" id="signup-title">
          SIGN UP
        </h1>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              autoComplete="new-password"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
              type="password"
              value={password}
            />
          </label>
          <label>
            <span>Confirm Password</span>
            <input
              autoComplete="new-password"
              minLength={6}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat password"
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" disabled={loading} type="submit">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <button className="button button--ghost" disabled={loading} onClick={handleGoogleSignIn} type="button">
            Continue with Google
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/sign-in">Sign in</Link>
        </p>
      </section>
    </main>
  )
}
