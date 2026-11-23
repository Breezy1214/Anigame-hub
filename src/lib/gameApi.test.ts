import { describe, expect, it, vi } from 'vitest'
import { mockFetch } from '../test/mockFetch'
import { getGameDetails, getGameHome, searchGames } from './gameApi'

const witcher = {
  id: 3328,
  name: 'The Witcher 3: Wild Hunt',
  background_image: 'https://media.rawg.io/media/games/618/w3.jpg',
  released: '2015-05-18',
  metacritic: 92,
  rating: 4.65,
  ratings_count: 7000,
  genres: [{ name: 'RPG' }],
}

const witcherSummary = {
  id: '3328',
  type: 'game',
  title: 'The Witcher 3: Wild Hunt',
  coverUrl: 'https://media.rawg.io/media/resize/640/-/games/618/w3.jpg',
  coverColor: null,
  releaseYear: 2015,
  score: 92,
  category: 'RPG',
}

describe('searchGames', () => {
  it('maps RAWG results to media summaries', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'test-key')
    const fetchMock = mockFetch(200, {
      results: [
        witcher,
        { id: 8, name: 'Fan favorite', background_image: null, released: null, metacritic: null, rating: 4.1 },
        { id: 9, name: 'Unreleased', background_image: null, released: null, metacritic: null, rating: 0 },
      ],
    })

    expect(await searchGames('witcher')).toEqual([
      witcherSummary,
      {
        id: '8',
        type: 'game',
        title: 'Fan favorite',
        coverUrl: null,
        coverColor: null,
        releaseYear: null,
        score: 82,
        category: null,
      },
      {
        id: '9',
        type: 'game',
        title: 'Unreleased',
        coverUrl: null,
        coverColor: null,
        releaseYear: null,
        score: null,
        category: null,
      },
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

describe('getGameDetails', () => {
  it('maps a RAWG game to details', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'test-key')
    const fetchMock = mockFetch(200, {
      ...witcher,
      background_image: null,
      background_image_additional: 'https://media.rawg.io/media/screenshots/w3-wide.jpg',
      description_raw: ' Geralt hunts monsters. ',
      platforms: [{ platform: { name: 'PC' } }, { platform: { name: 'PlayStation 4' } }],
    })

    expect(await getGameDetails('3328')).toEqual({
      ...witcherSummary,
      coverUrl: null,
      bannerUrl: 'https://media.rawg.io/media/resize/1280/-/screenshots/w3-wide.jpg',
      description: 'Geralt hunts monsters.',
      genres: ['RPG'],
      releaseDate: '2015-05-18',
      platforms: ['PC', 'PlayStation 4'],
    })
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe('/api/games/3328')
  })
})

describe('getGameHome', () => {
  it('loads recent trending games and a top list of well-rated games', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'test-key')
    const obscure = { ...witcher, id: 1, ratings_count: 3 }
    const fetchMock = mockFetch(200, { results: [obscure, witcher] })

    const home = await getGameHome(undefined, new Date('2026-11-23T12:00:00Z'))
    expect(home.trending.map((game) => game.id)).toEqual(['1', '3328'])
    expect(home.top.map((game) => game.id)).toEqual(['3328'])

    const [trendingUrl, topUrl] = fetchMock.mock.calls.map(([url]) => new URL(url).searchParams)
    expect(trendingUrl.get('dates')).toBe('2026-05-23,2026-11-23')
    expect(trendingUrl.get('ordering')).toBe('-added')
    expect(topUrl.get('ordering')).toBe('-metacritic')
  })
})
