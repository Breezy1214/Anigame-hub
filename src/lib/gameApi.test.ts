import { describe, expect, it, vi } from 'vitest'
import { mockFetch } from '../test/mockFetch'
import { searchGames } from './gameApi'

describe('searchGames', () => {
  it('maps RAWG results to media summaries', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'test-key')
    const fetchMock = mockFetch(200, {
      results: [
        {
          id: 3328,
          name: 'The Witcher 3: Wild Hunt',
          background_image: 'https://media.rawg.io/media/games/618/w3.jpg',
          released: '2015-05-18',
        },
        { id: 9, name: 'Unreleased', background_image: null, released: null },
      ],
    })

    expect(await searchGames('witcher')).toEqual([
      {
        id: '3328',
        type: 'game',
        title: 'The Witcher 3: Wild Hunt',
        coverUrl: 'https://media.rawg.io/media/resize/640/-/games/618/w3.jpg',
        releaseYear: 2015,
      },
      { id: '9', type: 'game', title: 'Unreleased', coverUrl: null, releaseYear: null },
    ])
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.pathname).toBe('/api/games')
    expect(url.searchParams.get('search')).toBe('witcher')
    expect(url.searchParams.get('key')).toBe('test-key')
  })

  it('throws on HTTP errors', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'test-key')
    mockFetch(401, { error: 'The key parameter is not provided' })
    await expect(searchGames('witcher')).rejects.toThrow()
  })

  it('throws without an API key', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', '')
    const fetchMock = mockFetch(200, { results: [] })
    await expect(searchGames('witcher')).rejects.toThrow('VITE_RAWG_API_KEY')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
