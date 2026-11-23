import { describe, expect, it } from 'vitest'
import { mockFetch } from '../test/mockFetch'
import { getAnimeDetails, getAnimeHome, searchAnime, seasonOf } from './animeApi'

const frieren = {
  id: 154587,
  title: { romaji: 'Sousou no Frieren', english: 'Frieren: Beyond Journey’s End' },
  coverImage: { large: 'https://img/frieren.jpg', color: '#e4e4f1' },
  startDate: { year: 2023 },
  averageScore: 90,
  format: 'TV',
}

const frierenSummary = {
  id: '154587',
  type: 'anime',
  title: 'Frieren: Beyond Journey’s End',
  coverUrl: 'https://img/frieren.jpg',
  coverColor: '#e4e4f1',
  releaseYear: 2023,
  score: 90,
  category: 'TV',
}

describe('searchAnime', () => {
  it('maps AniList results to media summaries', async () => {
    const fetchMock = mockFetch(200, {
      data: {
        Page: {
          media: [
            frieren,
            {
              id: 2,
              title: { romaji: 'Romaji Only', english: null },
              coverImage: { large: null, color: null },
              startDate: { year: null },
              averageScore: null,
              format: 'TV_SHORT',
            },
          ],
        },
      },
    })

    expect(await searchAnime('frieren')).toEqual([
      frierenSummary,
      {
        id: '2',
        type: 'anime',
        title: 'Romaji Only',
        coverUrl: null,
        coverColor: null,
        releaseYear: null,
        score: null,
        category: 'TV short',
      },
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
          // DETAILS_QUERY aliases the extraLarge cover as `large`.
          coverImage: { large: 'https://img/bebop-xl.jpg', color: '#f1785d' },
          bannerImage: 'https://img/bebop-banner.jpg',
          startDate: { year: 1998, month: 4, day: 3 },
          averageScore: 86,
          format: 'TV',
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
      coverUrl: 'https://img/bebop-xl.jpg',
      coverColor: '#f1785d',
      releaseYear: 1998,
      score: 86,
      category: 'TV',
      bannerUrl: 'https://img/bebop-banner.jpg',
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
          coverImage: { large: null, color: null },
          bannerImage: null,
          startDate: { year: 2027, month: 10, day: null },
          averageScore: null,
          format: null,
          description: null,
          genres: [],
          episodes: null,
        },
      },
    })
    expect(await getAnimeDetails('2')).toMatchObject({ releaseDate: '2027-10', description: null, category: null })
  })
})

describe('seasonOf', () => {
  it('names the anime season a date falls in', () => {
    expect(seasonOf(new Date(2026, 0, 15))).toEqual({ season: 'WINTER', year: 2026, label: 'Winter 2026' })
    expect(seasonOf(new Date(2026, 10, 23))).toEqual({ season: 'FALL', year: 2026, label: 'Fall 2026' })
  })
})

describe('getAnimeHome', () => {
  it('loads trending, seasonal and top anime in one request', async () => {
    const fetchMock = mockFetch(200, {
      data: { trending: { media: [frieren] }, season: { media: [] }, top: { media: [frieren] } },
    })

    expect(await getAnimeHome(undefined, new Date(2026, 6, 1))).toEqual({
      trending: [frierenSummary],
      season: [],
      seasonLabel: 'Summer 2026',
      top: [frierenSummary],
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).variables).toEqual({ season: 'SUMMER', year: 2026 })
  })
})
