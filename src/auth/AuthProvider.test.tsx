import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from './AuthContext'
import AuthProvider from './AuthProvider'

type Listener = (event: string, session: { user: { id: string; email: string } } | null) => void
const { listeners, unsubscribe } = vi.hoisted(() => ({ listeners: [] as Listener[], unsubscribe: vi.fn() }))
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (listener: Listener) => {
        listeners.push(listener)
        return { data: { subscription: { unsubscribe } } }
      },
    },
  },
}))

function Probe() {
  const { user, loading } = useAuth()
  return <p>{loading ? 'loading' : (user?.email ?? 'signed out')}</p>
}

describe('AuthProvider', () => {
  it('tracks the session through auth state changes', () => {
    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByText('loading')).toBeInTheDocument()

    act(() => listeners.at(-1)!('INITIAL_SESSION', null))
    expect(screen.getByText('signed out')).toBeInTheDocument()

    act(() => listeners.at(-1)!('SIGNED_IN', { user: { id: 'u1', email: 'a@b.co' } }))
    expect(screen.getByText('a@b.co')).toBeInTheDocument()

    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
