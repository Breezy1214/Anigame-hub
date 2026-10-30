import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import RegisterPage from './RegisterPage'

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }))
vi.mock('../lib/auth', () => ({ signUp }))

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/" element={<p>home</p>} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillAndSubmit(email: string, password: string, confirm = password) {
  const user = userEvent.setup({ delay: null })
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.type(screen.getByLabelText('Confirm password'), confirm)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

describe('RegisterPage', () => {
  it('does not sign up when validation fails', async () => {
    renderPage()
    await fillAndSubmit('a@b.co', 'password1', 'different1')
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(signUp).not.toHaveBeenCalled()
  })

  it('shows the confirmation message when email verification is required', async () => {
    signUp.mockResolvedValue({ status: 'confirm-email' })
    renderPage()
    await fillAndSubmit('a@b.co', 'password1')
    expect(signUp).toHaveBeenCalledWith('a@b.co', 'password1')
    expect(await screen.findByRole('status')).toHaveTextContent('a@b.co')
  })

  it('redirects home when signed in immediately', async () => {
    signUp.mockResolvedValue({ status: 'signed-in' })
    renderPage()
    await fillAndSubmit('a@b.co', 'password1')
    expect(await screen.findByText('home')).toBeInTheDocument()
  })

  it('shows sign-up errors', async () => {
    signUp.mockResolvedValue({ status: 'error', message: 'Signups not allowed' })
    renderPage()
    await fillAndSubmit('a@b.co', 'password1')
    expect(await screen.findByRole('alert')).toHaveTextContent('Signups not allowed')
  })
})
