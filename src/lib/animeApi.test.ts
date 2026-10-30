import { describe, expect, it, vi } from 'vitest'
import { searchAnime } from './animeApi'

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

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
