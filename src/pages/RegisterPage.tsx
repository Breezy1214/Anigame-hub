import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field'
import FormError from '../components/FormError'
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
    if (result.status === 'signed-in') navigate('/', { replace: true })
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
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          id="confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <FormError message={error} />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  )
}
