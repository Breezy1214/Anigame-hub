import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import SearchPage from './SearchPage'

const { searchMedia } = vi.hoisted(() => ({ searchMedia: vi.fn() }))
vi.mock('../lib/mediaService', () => ({ searchMedia }))

const frieren = { id: '1', type: 'anime', title: 'Frieren', coverUrl: null, releaseYear: 2023 }

function renderPage(url = '/search') {
  render(
    <MemoryRouter initialEntries={[url]}>
      <SearchPage />
    </MemoryRouter>,
  )
}

describe('SearchPage', () => {
  it('searches when the form is submitted', async () => {
    searchMedia.mockResolvedValue([frieren])
    renderPage()
    await userEvent.type(screen.getByLabelText('Anime title'), 'frieren{Enter}')
    expect(await screen.findByRole('heading', { name: 'Frieren' })).toBeInTheDocument()
    expect(searchMedia).toHaveBeenCalledWith('anime', 'frieren', expect.any(AbortSignal))
  })

  it('runs the search from the URL', async () => {
    searchMedia.mockResolvedValue([])
    renderPage('/search?q=nothing')
    expect(screen.getByLabelText('Anime title')).toHaveValue('nothing')
    expect(await screen.findByText('No results for “nothing”.')).toBeInTheDocument()
  })

  it('shows an error when the API fails', async () => {
    searchMedia.mockRejectedValue(new Error('down'))
    renderPage('/search?q=frieren')
    expect(await screen.findByRole('alert')).toHaveTextContent('Search is unavailable')
  })

  it('switches to game search and keeps the query', async () => {
    searchMedia.mockResolvedValue([])
    renderPage('/search?q=zelda')
    await userEvent.click(screen.getByRole('button', { name: 'Games' }))
    expect(screen.getByRole('button', { name: 'Games' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Game title')).toHaveValue('zelda')
    expect(await screen.findByText('No results for “zelda”.')).toBeInTheDocument()
    expect(searchMedia).toHaveBeenLastCalledWith('game', 'zelda', expect.any(AbortSignal))
  })
})
