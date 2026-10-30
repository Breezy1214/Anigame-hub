import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { MediaDetails } from '../lib/media'
import MediaDetailsPage from './MediaDetailsPage'

const { getMediaDetails } = vi.hoisted(() => ({ getMediaDetails: vi.fn() }))
vi.mock('../lib/mediaService', () => ({ getMediaDetails }))

const bebop: MediaDetails = {
  id: '1',
  type: 'anime',
  title: 'Cowboy Bebop',
  coverUrl: 'https://img/bebop.jpg',
  releaseYear: 1998,
  description: 'Bounty hunters in space.',
  genres: ['Action', 'Sci-Fi'],
  releaseDate: '1998',
  episodeCount: 26,
}

function renderPage(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/media/:type/:id" element={<MediaDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MediaDetailsPage', () => {
  it('shows anime details', async () => {
    getMediaDetails.mockResolvedValue(bebop)
    renderPage('/media/anime/1')
    expect(await screen.findByRole('heading', { name: 'Cowboy Bebop' })).toBeInTheDocument()
    expect(getMediaDetails).toHaveBeenCalledWith('anime', '1', expect.any(AbortSignal))
    expect(screen.getByRole('img', { name: 'Cover of Cowboy Bebop' })).toHaveAttribute('src', 'https://img/bebop.jpg')
    expect(screen.getByText('Bounty hunters in space.')).toBeInTheDocument()
    expect(screen.getByText('Action, Sci-Fi')).toBeInTheDocument()
    expect(screen.getByText('26')).toBeInTheDocument()
    expect(screen.queryByText('Platforms')).not.toBeInTheDocument()
  })

  it('shows game platforms', async () => {
    getMediaDetails.mockResolvedValue({ ...bebop, type: 'game', platforms: ['PC', 'Switch'] })
    renderPage('/media/game/1')
    expect(await screen.findByText('PC, Switch')).toBeInTheDocument()
    expect(screen.queryByText('Episodes')).not.toBeInTheDocument()
  })

  it('shows an error when loading fails', async () => {
    getMediaDetails.mockRejectedValue(new Error('404'))
    renderPage('/media/anime/999')
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t load this title')
  })

  it('rejects unknown media types without fetching', () => {
    renderPage('/media/movie/1')
    expect(screen.getByRole('alert')).toHaveTextContent('doesn’t exist')
    expect(getMediaDetails).not.toHaveBeenCalled()
  })
})
