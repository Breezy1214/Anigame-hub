import { render, screen } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { withAuth } from '../test/renderWithAuth'
import RequireAuth from './RequireAuth'

const routes = [
  <Route key="home" path="/" element={<p>home page</p>} />,
  <Route key="auth" element={<RequireAuth />}>
    <Route path="/dashboard" element={<p>dashboard</p>} />
  </Route>,
]

describe('RequireAuth', () => {
  it('sends users home when their session ends on a protected page', () => {
    const { rerender } = render(withAuth({ id: 'user-1' }, '/dashboard', routes))
    expect(screen.getByText('dashboard')).toBeInTheDocument()

    rerender(withAuth(null, '/dashboard', routes))
    expect(screen.getByText('home page')).toBeInTheDocument()
  })
})
