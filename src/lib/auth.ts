import { isAuthRetryableFetchError, type AuthError } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type AuthResult = { status: 'signed-in' } | { status: 'error'; message: string }
export type SignUpResult = AuthResult | { status: 'confirm-email' }

const EMAIL_TAKEN = 'An account with this email already exists.'

const MESSAGES: Partial<Record<string, string>> = {
  user_already_exists: EMAIL_TAKEN,
  email_exists: EMAIL_TAKEN,
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed: 'Confirm your email address before logging in.',
}

function authError(error: AuthError): { status: 'error'; message: string } {
  if (isAuthRetryableFetchError(error)) {
    return { status: 'error', message: 'Could not reach the server. Please try again.' }
  }
  return { status: 'error', message: (error.code && MESSAGES[error.code]) || error.message }
}

export async function signUp(email: string, password: string): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  })

  if (error) return authError(error)
  // With email confirmation on, Supabase returns an identity-less user instead of an error for taken emails.
  if (data.user?.identities?.length === 0) {
    return { status: 'error', message: EMAIL_TAKEN }
  }
  return data.session ? { status: 'signed-in' } : { status: 'confirm-email' }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? authError(error) : { status: 'signed-in' }
}

export async function signOut() {
  await supabase.auth.signOut()
}
