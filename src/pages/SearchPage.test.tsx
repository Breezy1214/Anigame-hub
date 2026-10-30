import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import SearchPage from './SearchPage'

const { searchAnime } = vi.hoisted(() => ({ searchAnime: vi.fn() }))
vi.mock('../lib/animeApi', () => ({ searchAnime }))

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
    searchAnime.mockResolvedValue([frieren])
    renderPage()
    await userEvent.type(screen.getByLabelText('Anime title'), 'frieren{Enter}')
    expect(await screen.findByRole('heading', { name: 'Frieren' })).toBeInTheDocument()
    expect(searchAnime).toHaveBeenCalledWith('frieren', expect.any(AbortSignal))
  })

  it('runs the search from the URL', async () => {
    searchAnime.mockResolvedValue([])
    renderPage('/search?q=nothing')
    expect(screen.getByLabelText('Anime title')).toHaveValue('nothing')
    expect(await screen.findByText('No results for “nothing”.')).toBeInTheDocument()
  })

  it('shows an error when the API fails', async () => {
    searchAnime.mockRejectedValue(new Error('down'))
    renderPage('/search?q=frieren')
    expect(await screen.findByRole('alert')).toHaveTextContent('Search is unavailable')
  })
})
