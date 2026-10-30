import type { User } from '@supabase/supabase-js'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'
import RequireAuth from '../auth/RequireAuth'

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

/** Renders `page` at `path` under RequireAuth, with a stub login page that shows "login page". */
export function renderProtectedRoute(user: Partial<User> | null, path: string, page: ReactNode) {
  return renderWithAuth(user, path, [
    <Route key="auth" element={<RequireAuth />}>
      <Route path={path} element={page} />
    </Route>,
    <Route key="login" path="/login" element={<p>login page</p>} />,
  ])
}
