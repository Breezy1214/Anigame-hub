import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { userMediaEntry as entry } from '../test/fixtures'
import { renderProtectedRoute } from '../test/renderWithAuth'
import DashboardPage from './DashboardPage'

const { listUserMedia } = vi.hoisted(() => ({ listUserMedia: vi.fn() }))
vi.mock('../lib/userMedia', () => ({ listUserMedia }))

function renderPage(user: { id: string } | null = { id: 'user-1' }) {
  renderProtectedRoute(user, '/dashboard', <DashboardPage />)
}

function statValue(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextSibling
}

/** The leading word of each item's text in a named list, which is enough to tell the fixtures apart. */
function titlesIn(list: string) {
  return within(screen.getByRole('list', { name: list }))
    .getAllByRole('link')
    .map((link) => link.textContent?.match(/^(Frieren|Zelda|Bebop|Trigun|Mob Psycho|Monster)/)?.[0])
}

describe('DashboardPage', () => {
  it('sends signed-out visitors to log in', () => {
    renderPage(null)
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('shows counts, recently updated, in progress and favorites', async () => {
    listUserMedia.mockResolvedValue([
      entry({ id: '1', title: 'Frieren', status: 'in_progress', favorite: true }),
      entry({ id: '2', title: 'Zelda', media_type: 'game', status: 'in_progress' }),
      entry({ id: '3', title: 'Bebop', status: 'completed', favorite: true }),
      entry({ id: '4', title: 'Trigun' }),
      entry({ id: '5', title: 'Mob Psycho' }),
      entry({ id: '6', title: 'Monster', status: 'dropped' }),
    ])
    renderPage()

    await screen.findByRole('list', { name: 'Recently updated' })
    expect(statValue('Saved')).toHaveTextContent('6')
    expect(statValue('Anime')).toHaveTextContent('5')
    expect(statValue('Games')).toHaveTextContent('1')
    expect(statValue('Favorites')).toHaveTextContent('2')

    expect(titlesIn('Recently updated')).toEqual(['Frieren', 'Zelda', 'Bebop', 'Trigun', 'Mob Psycho'])
    expect(titlesIn('In Progress')).toEqual(['Frieren', 'Zelda'])
    expect(titlesIn('Favorites')).toEqual(['Frieren', 'Bebop'])
    expect(screen.getByRole('link', { name: 'See all 6 saved titles' })).toHaveAttribute('href', '/profile')
    expect(listUserMedia).toHaveBeenCalledWith('user-1', expect.any(AbortSignal))
  })

  it('points new users to search', async () => {
    listUserMedia.mockResolvedValue([])
    renderPage()
    expect(await screen.findByRole('link', { name: 'Search for anime and games' })).toHaveAttribute('href', '/search')
  })

  it('shows an error when the list fails to load', async () => {
    listUserMedia.mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t load this list')
  })
})
