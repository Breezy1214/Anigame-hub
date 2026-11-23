import { screen, within } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { mediaSummary, userMediaEntry } from '../test/fixtures'
import { renderWithAuth } from '../test/renderWithAuth'
import HomePage from './HomePage'

const { getAnimeHome, getGameHome, listInProgress } = vi.hoisted(() => ({
  getAnimeHome: vi.fn(),
  getGameHome: vi.fn(),
  listInProgress: vi.fn(),
}))
vi.mock('../lib/mediaService', () => ({ getAnimeHome, getGameHome }))
vi.mock('../lib/userMedia', () => ({ listInProgress }))

const frieren = mediaSummary({ id: '154587', title: 'Frieren', score: 90, category: 'TV' })
const witcher = mediaSummary({ id: '3328', type: 'game', title: 'The Witcher 3', score: 92 })

function renderPage(user: { id: string } | null = null) {
  renderWithAuth(user, '/', <Route path="/" element={<HomePage />} />)
}

describe('HomePage', () => {
  it('shows trending, top and seasonal shelves for both media types', async () => {
    getAnimeHome.mockResolvedValue({ trending: [frieren], season: [frieren], seasonLabel: 'Fall 2026', top: [frieren] })
    getGameHome.mockResolvedValue({ trending: [witcher], top: [witcher] })
    renderPage()

    const trendingAnime = await screen.findByRole('list', { name: 'Trending anime' })
    expect(within(trendingAnime).getByRole('heading', { name: 'Frieren' })).toBeInTheDocument()
    expect(within(trendingAnime).getByText('90%')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Trending games' })).getByText('The Witcher 3')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Top anime' })).getByRole('link')).toHaveAttribute(
      'href',
      '/media/anime/154587',
    )
    expect(screen.getByRole('list', { name: 'Popular in Fall 2026' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create a free account' })).toHaveAttribute('href', '/register')
  })

  it('keeps the anime shelves when game data fails to load', async () => {
    getAnimeHome.mockResolvedValue({ trending: [frieren], season: [], seasonLabel: 'Fall 2026', top: [] })
    getGameHome.mockRejectedValue(new Error('Missing VITE_RAWG_API_KEY'))
    renderPage()

    expect(await screen.findByRole('list', { name: 'Trending anime' })).toBeInTheDocument()
    expect(await screen.findByText('Couldn’t load trending games right now.')).toBeInTheDocument()
  })

  it('shows signed-in users what they are in the middle of', async () => {
    getAnimeHome.mockResolvedValue({ trending: [], season: [], seasonLabel: 'Fall 2026', top: [] })
    getGameHome.mockResolvedValue({ trending: [], top: [] })
    listInProgress.mockResolvedValue([userMediaEntry({ id: 'a', title: 'Frieren', status: 'in_progress', progress: 12 })])
    renderPage({ id: 'user-1' })

    const inProgress = await screen.findByRole('list', { name: 'In progress' })
    expect(listInProgress).toHaveBeenCalledWith('user-1', 6, expect.any(AbortSignal))
    expect(within(inProgress).getByText('Anime · Episode 12')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Create a free account' })).not.toBeInTheDocument()
  })
})
