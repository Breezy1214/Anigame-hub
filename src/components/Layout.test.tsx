import type { User } from '@supabase/supabase-js'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/AuthContext'
import Layout from './Layout'

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }))
vi.mock('../lib/auth', () => ({ signOut }))

function renderLayout(user: Partial<User> | null) {
  render(
    <AuthContext.Provider value={{ user: user as User | null, loading: false }}>
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<p>page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('Layout', () => {
  it('offers log in and register to signed-out visitors', () => {
    renderLayout(null)
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
  })

  it('logs signed-in users out', async () => {
    signOut.mockResolvedValue(undefined)
    renderLayout({ email: 'a@b.co' })
    expect(screen.getByText('a@b.co')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(signOut).toHaveBeenCalled()
  })
})
