import type { User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthState = { user: User | null; loading: boolean }

export const AuthContext = createContext<AuthState>({ user: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}
