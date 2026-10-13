import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../lib/auth'
import { validateRegistration } from '../lib/validation'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateRegistration(email, password, confirmPassword)
    setError(validationError)
    if (validationError) return

    setSubmitting(true)
    const result = await signUp(email, password)
    setSubmitting(false)
    if (result.status === 'signed-in') navigate('/')
    else if (result.status === 'confirm-email') setAwaitingConfirmation(true)
    else setError(result.message)
  }

  if (awaitingConfirmation) {
    return (
      <main className="auth-page">
        <h1>Check your email</h1>
        <p role="status">
          We sent a confirmation link to <strong>{email}</strong>. Open it to activate your account.
        </p>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <h1>Create your account</h1>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  )
}
