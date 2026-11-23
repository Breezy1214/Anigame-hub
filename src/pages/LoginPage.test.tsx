import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }))
vi.mock('../lib/auth', () => ({ signIn }))

function renderPage(entry: string | { pathname: string; state: unknown } = '/login') {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/" element={<p>home</p>} />
        <Route path="/media/anime/1" element={<p>details</p>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function submit(email: string, password: string) {
  const user = userEvent.setup({ delay: null })
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (password) await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('LoginPage', () => {
  it('requires both fields', async () => {
    renderPage()
    await submit('a@b.co', '')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email and password.')
    expect(signIn).not.toHaveBeenCalled()
  })

  it('goes home after logging in', async () => {
    signIn.mockResolvedValue({ status: 'signed-in' })
    renderPage()
    await submit('a@b.co', 'password1')
    expect(signIn).toHaveBeenCalledWith('a@b.co', 'password1')
    expect(await screen.findByText('home')).toBeInTheDocument()
  })

  it('shows login errors', async () => {
    signIn.mockResolvedValue({ status: 'error', message: 'Incorrect email or password.' })
    renderPage()
    await submit('a@b.co', 'wrong')
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
  })

  it('returns to the page that asked for login', async () => {
    signIn.mockResolvedValue({ status: 'signed-in' })
    renderPage({ pathname: '/login', state: { from: '/media/anime/1' } })
    await submit('a@b.co', 'password1')
    expect(await screen.findByText('details')).toBeInTheDocument()
  })
})
