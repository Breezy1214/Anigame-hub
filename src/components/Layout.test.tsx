import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from '@supabase/supabase-js'
import { Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { renderWithAuth } from '../test/renderWithAuth'
import Layout from './Layout'

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }))
vi.mock('../lib/auth', () => ({ signOut }))

function renderLayout(user: Partial<User> | null) {
  renderWithAuth(
    user,
    '/',
    <Route element={<Layout />}>
      <Route path="/" element={<p>page</p>} />
    </Route>,
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
