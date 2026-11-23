import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthState } from './AuthContext'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    // Fires immediately with the stored session (INITIAL_SESSION), then on every sign-in/out.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      // Token refreshes and tab refocus re-emit the same user; keep the context value stable for them.
      setState((prev) =>
        !prev.loading && prev.user?.id === user?.id && prev.user?.updated_at === user?.updated_at
          ? prev
          : { user, loading: false },
      )
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
