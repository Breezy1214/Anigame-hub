import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field'
import FormError from '../components/FormError'
import { signIn } from '../lib/auth'
import { validateLogin } from '../lib/validation'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateLogin(email, password)
    setError(validationError)
    if (validationError) return

    setSubmitting(true)
    const result = await signIn(email, password)
    setSubmitting(false)
    if (result.status === 'signed-in') navigate('/', { replace: true })
    else setError(result.message)
  }

  return (
    <main className="auth-page">
      <h1>Log in</h1>
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <FormError message={error} />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </main>
  )
}
