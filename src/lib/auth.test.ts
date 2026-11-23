import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { signIn, signUp } from './auth'

const { supabaseSignUp, signInWithPassword } = vi.hoisted(() => ({
  supabaseSignUp: vi.fn(),
  signInWithPassword: vi.fn(),
}))
vi.mock('./supabase', () => ({ supabase: { auth: { signUp: supabaseSignUp, signInWithPassword } } }))

const user = { identities: [{}] }

describe('signUp', () => {
  it('is signed in when Supabase returns a session', async () => {
    supabaseSignUp.mockResolvedValue({ data: { user, session: {} }, error: null })
    expect(await signUp('a@b.co', 'password1')).toEqual({ status: 'signed-in' })
  })

  it('needs email confirmation when there is no session', async () => {
    supabaseSignUp.mockResolvedValue({ data: { user, session: null }, error: null })
    expect(await signUp('a@b.co', 'password1')).toEqual({ status: 'confirm-email' })
  })

  it('treats an identity-less user as an existing account', async () => {
    supabaseSignUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null })
    expect(await signUp('a@b.co', 'password1')).toEqual({
      status: 'error',
      message: 'An account with this email already exists.',
    })
  })

  it('maps network failures to a friendly message', async () => {
    supabaseSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthRetryableFetchError('Failed to fetch', 0),
    })
    expect(await signUp('a@b.co', 'password1')).toEqual({
      status: 'error',
      message: 'Could not reach the server. Please try again.',
    })
  })

  it('passes through other Supabase errors', async () => {
    supabaseSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthApiError('Signups not allowed', 422, 'signup_disabled'),
    })
    expect(await signUp('a@b.co', 'password1')).toEqual({ status: 'error', message: 'Signups not allowed' })
  })
})

describe('signIn', () => {
  it('signs in with valid credentials', async () => {
    signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null })
    expect(await signIn('a@b.co', 'password1')).toEqual({ status: 'signed-in' })
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.co', password: 'password1' })
  })

  it('maps invalid credentials to a friendly message', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    })
    expect(await signIn('a@b.co', 'wrong')).toEqual({ status: 'error', message: 'Incorrect email or password.' })
  })

  it('asks unconfirmed users to confirm their email', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new AuthApiError('Email not confirmed', 400, 'email_not_confirmed'),
    })
    expect(await signIn('a@b.co', 'password1')).toEqual({
      status: 'error',
      message: 'Confirm your email address before logging in.',
    })
  })
})
