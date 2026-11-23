import { isAuthRetryableFetchError } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type SignUpResult =
  | { status: 'signed-in' }
  | { status: 'confirm-email' }
  | { status: 'error'; message: string }

const EMAIL_TAKEN = 'An account with this email already exists.'

export async function signUp(email: string, password: string): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  })

  if (error) {
    if (isAuthRetryableFetchError(error)) {
      return { status: 'error', message: 'Could not reach the server. Please try again.' }
    }
    if (error.code === 'user_already_exists' || error.code === 'email_exists') {
      return { status: 'error', message: EMAIL_TAKEN }
    }
    return { status: 'error', message: error.message }
  }
  // With email confirmation on, Supabase returns an identity-less user instead of an error for taken emails.
  if (data.user?.identities?.length === 0) {
    return { status: 'error', message: EMAIL_TAKEN }
  }
  return data.session ? { status: 'signed-in' } : { status: 'confirm-email' }
}
