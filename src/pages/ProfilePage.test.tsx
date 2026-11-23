import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { userMediaEntry as entry, profileRow } from '../test/fixtures'
import { renderProtectedRoute } from '../test/renderWithAuth'
import ProfilePage from './ProfilePage'

const { getProfile, saveProfile, listUserMedia } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  saveProfile: vi.fn(),
  listUserMedia: vi.fn(),
}))
vi.mock('../lib/profiles', () => ({ getProfile, saveProfile }))
vi.mock('../lib/userMedia', () => ({ listUserMedia }))

const profile = profileRow()

function renderPage(user: { id: string } | null = { id: 'user-1' }) {
  renderProtectedRoute(user, '/profile', <ProfilePage />)
}

describe('ProfilePage', () => {
  it('sends signed-out visitors to log in', () => {
    renderPage(null)
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(getProfile).not.toHaveBeenCalled()
  })

  it('shows the profile and the list grouped by status with ratings, favorites and progress', async () => {
    getProfile.mockResolvedValue(profile)
    listUserMedia.mockResolvedValue([
      entry({ id: 'a', title: 'Cowboy Bebop', status: 'completed', rating: 9, favorite: true }),
      entry({ id: 'b', title: 'Frieren', status: 'in_progress', progress: 12 }),
      entry({ id: 'c', title: 'Zelda', media_type: 'game', status: 'in_progress', progress: 40 }),
    ])
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Spike Spiegel' })).toBeInTheDocument()
    const favorites = await screen.findByRole('list', { name: 'Favorites' })
    expect(within(favorites).getByText('Cowboy Bebop')).toBeInTheDocument()

    const watched = screen.getByRole('list', { name: 'Watched / Played' })
    expect(within(watched).getByText('Anime · 9 / 10')).toBeInTheDocument()
    expect(within(watched).getByRole('img', { name: 'Favorite' })).toBeInTheDocument()

    const inProgress = screen.getByRole('list', { name: 'In Progress' })
    expect(within(inProgress).getByText('Anime · Episode 12')).toBeInTheDocument()
    expect(within(inProgress).getByText('Video game · 40% complete')).toBeInTheDocument()
    expect(within(inProgress).getByRole('link', { name: /Zelda/ })).toHaveAttribute('href', '/media/game/1')
    expect(screen.queryByRole('list', { name: 'Dropped' })).not.toBeInTheDocument()
  })

  it('asks new users to choose a username', async () => {
    getProfile.mockResolvedValue(null)
    listUserMedia.mockResolvedValue([])
    saveProfile.mockResolvedValue({ status: 'saved', profile: { ...profile, display_name: null } })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Set up your profile' })).toBeInTheDocument()
    expect(await screen.findByText(/Nothing saved yet/)).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Username'), 'Spike')
    await userEvent.click(screen.getByRole('button', { name: 'Create profile' }))
    expect(saveProfile).toHaveBeenCalledWith({ username: 'spike', display_name: null, bio: null, is_public: false })
    expect(await screen.findByRole('heading', { name: 'spike' })).toBeInTheDocument()
  })

  it('validates usernames before saving', async () => {
    getProfile.mockResolvedValue(null)
    listUserMedia.mockResolvedValue([])
    renderPage()

    await userEvent.type(await screen.findByLabelText('Username'), 'no')
    await userEvent.click(screen.getByRole('button', { name: 'Create profile' }))
    expect(screen.getByRole('alert')).toHaveTextContent('3–20 characters')
    expect(saveProfile).not.toHaveBeenCalled()
  })

  it('shows a taken username', async () => {
    getProfile.mockResolvedValue(profile)
    listUserMedia.mockResolvedValue([])
    saveProfile.mockResolvedValue({ status: 'error', message: 'That username is taken.' })
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Save profile' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That username is taken.')
  })

  it('makes the profile public and links to it', async () => {
    getProfile.mockResolvedValue(profile)
    listUserMedia.mockResolvedValue([])
    saveProfile.mockResolvedValue({ status: 'saved', profile: { ...profile, is_public: true } })
    renderPage()

    await userEvent.click(await screen.findByRole('checkbox', { name: /Make my profile public/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(saveProfile).toHaveBeenCalledWith(expect.objectContaining({ is_public: true }))
    expect(await screen.findByRole('link', { name: 'View public profile' })).toHaveAttribute('href', '/u/spike')
    expect(screen.getByLabelText('Share your profile')).toHaveValue(`${window.location.origin}/u/spike`)
  })
})
