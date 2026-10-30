import type { User } from '@supabase/supabase-js'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Routes } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'

/**
 * Renders `routes` inside a router starting at `url`, with `user` signed in (or signed out when null).
 * `routes` are <Route> elements.
 */
export function renderWithAuth(user: Partial<User> | null, url: string, routes: ReactNode) {
  return render(
    <AuthContext.Provider value={{ user: user as User | null, loading: false }}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>{routes}</Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}
