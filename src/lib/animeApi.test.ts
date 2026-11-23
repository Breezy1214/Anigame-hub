import { describe, expect, it } from 'vitest'
import { mockFetch } from '../test/mockFetch'
import { getAnimeDetails, searchAnime } from './animeApi'

describe('searchAnime', () => {
  it('maps AniList results to media summaries', async () => {
    const fetchMock = mockFetch(200, {
      data: {
        Page: {
          media: [
            {
              id: 154587,
              title: { romaji: 'Sousou no Frieren', english: 'Frieren: Beyond Journey’s End' },
              coverImage: { large: 'https://img/frieren.jpg' },
              startDate: { year: 2023 },
            },
            { id: 2, title: { romaji: 'Romaji Only', english: null }, coverImage: { large: null }, startDate: { year: null } },
          ],
        },
      },
    })

    expect(await searchAnime('frieren')).toEqual([
      { id: '154587', type: 'anime', title: 'Frieren: Beyond Journey’s End', coverUrl: 'https://img/frieren.jpg', releaseYear: 2023 },
      { id: '2', type: 'anime', title: 'Romaji Only', coverUrl: null, releaseYear: null },
    ])
    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse(init.body).variables).toEqual({ search: 'frieren' })
  })

  it('throws on GraphQL errors', async () => {
    mockFetch(429, { data: null, errors: [{ message: 'Too Many Requests.' }] })
    await expect(searchAnime('frieren')).rejects.toThrow()
  })
})

describe('getAnimeDetails', () => {
  it('maps AniList media to details with plain-text descriptions', async () => {
    const fetchMock = mockFetch(200, {
      data: {
        Media: {
          id: 1,
          title: { romaji: 'Cowboy Bebop', english: 'Cowboy Bebop' },
          coverImage: { large: 'https://img/bebop.jpg' },
          startDate: { year: 1998, month: 4, day: 3 },
          description: 'Bounty hunters.<br><br>\nIn <i>space</i>.',
          genres: ['Action', 'Sci-Fi'],
          episodes: 26,
        },
      },
    })

    expect(await getAnimeDetails('1')).toEqual({
      id: '1',
      type: 'anime',
      title: 'Cowboy Bebop',
      coverUrl: 'https://img/bebop.jpg',
      releaseYear: 1998,
      description: 'Bounty hunters.\n\nIn space.',
      genres: ['Action', 'Sci-Fi'],
      releaseDate: '1998-04-03',
      episodeCount: 26,
    })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).variables).toEqual({ id: 1 })
  })

  it('keeps partial start dates', async () => {
    mockFetch(200, {
      data: {
        Media: {
          id: 2,
          title: { romaji: 'Upcoming', english: null },
          coverImage: { large: null },
          startDate: { year: 2027, month: 10, day: null },
          description: null,
          genres: [],
          episodes: null,
        },
      },
    })
    expect(await getAnimeDetails('2')).toMatchObject({ releaseDate: '2027-10', description: null })
  })
})
