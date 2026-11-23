import type { User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthState = { user: User | null; loading: boolean }

export const AuthContext = createContext<AuthState>({ user: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

/** The signed-in user, for pages under the RequireAuth route. */
export function useUser() {
  const { user } = useAuth()
  if (!user) throw new Error('useUser() needs a signed-in user; render the page under <RequireAuth>.')
  return user
}
