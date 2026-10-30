import type { MediaSummary } from './media'

const ANILIST_URL = 'https://graphql.anilist.co'

type AniListTitle = { romaji: string | null; english: string | null }

type AniListSummary = {
  id: number
  title: AniListTitle
  coverImage: { large: string | null }
  startDate: { year: number | null }
}

async function anilist<T>(query: string, variables: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal,
  })
  const body = (await response.json()) as { data: T; errors?: { message: string }[] }
  if (!response.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message ?? `AniList request failed (${response.status})`)
  }
  return body.data
}

const SEARCH_QUERY = `
  query ($search: String) {
    Page(perPage: 24) {
      media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
        id
        title { romaji english }
        coverImage { large }
        startDate { year }
      }
    }
  }
`

function titleOf(title: AniListTitle) {
  return title.english ?? title.romaji ?? 'Untitled'
}

export async function searchAnime(query: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  const data = await anilist<{ Page: { media: AniListSummary[] } }>(SEARCH_QUERY, { search: query }, signal)
  return data.Page.media.map((media) => ({
    id: String(media.id),
    type: 'anime',
    title: titleOf(media.title),
    coverUrl: media.coverImage.large,
    releaseYear: media.startDate.year,
  }))
}
