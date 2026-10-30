import { screen, within } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { userMediaEntry as entry, profileRow } from '../test/fixtures'
import { renderWithAuth } from '../test/renderWithAuth'
import PublicProfilePage from './PublicProfilePage'

const { getProfileByUsername, listUserMedia } = vi.hoisted(() => ({
  getProfileByUsername: vi.fn(),
  listUserMedia: vi.fn(),
}))
vi.mock('../lib/profiles', () => ({ getProfileByUsername }))
vi.mock('../lib/userMedia', () => ({ listUserMedia }))

const profile = profileRow({ bio: 'Bounty hunter.', is_public: true })

function renderPage(viewer: { id: string } | null = null) {
  renderWithAuth(viewer, '/u/spike', <Route path="/u/:username" element={<PublicProfilePage />} />)
}

describe('PublicProfilePage', () => {
  it('shows a public profile’s lists, favorites and current activity to signed-out visitors', async () => {
    getProfileByUsername.mockResolvedValue(profile)
    listUserMedia.mockResolvedValue([
      entry({ id: 'a', title: 'Frieren', status: 'in_progress', progress: 12 }),
      entry({ id: 'b', title: 'Cowboy Bebop', status: 'completed', rating: 10, favorite: true }),
    ])
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Spike Spiegel' })).toBeInTheDocument()
    expect(screen.getByText('Bounty hunter.')).toBeInTheDocument()
    expect(getProfileByUsername).toHaveBeenCalledWith('spike', expect.any(AbortSignal))
    expect(listUserMedia).toHaveBeenCalledWith('user-1', expect.any(AbortSignal))

    const inProgress = await screen.findByRole('list', { name: 'In Progress' })
    expect(within(inProgress).getByText('Anime · Episode 12')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Recently updated' })).getAllByRole('listitem')).toHaveLength(2)
    expect(within(screen.getByRole('list', { name: 'Favorites' })).getByText(/Cowboy Bebop/)).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Watched / Played' })).getByText('Anime · 10 / 10')).toBeInTheDocument()
    expect(screen.queryByText(/only you can see this page/)).not.toBeInTheDocument()
  })

  it('reports missing or private profiles', async () => {
    getProfileByUsername.mockResolvedValue(null)
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('doesn’t exist or isn’t public')
    expect(listUserMedia).not.toHaveBeenCalled()
  })

  it('tells owners when their profile is still private', async () => {
    getProfileByUsername.mockResolvedValue({ ...profile, is_public: false })
    listUserMedia.mockResolvedValue([])
    renderPage({ id: 'user-1' })
    expect(await screen.findByText('Your profile is private, so only you can see this page.')).toBeInTheDocument()
    expect(await screen.findByText('Nothing on this list yet.')).toBeInTheDocument()
  })
})
