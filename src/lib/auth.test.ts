import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signUp } from './auth'

const { supabaseSignUp } = vi.hoisted(() => ({ supabaseSignUp: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { auth: { signUp: supabaseSignUp } } }))

const user = { identities: [{}] }

describe('signUp', () => {
  beforeEach(() => supabaseSignUp.mockReset())

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
