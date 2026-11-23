import type { AnimeDetails, MediaSummary } from './media'

const ANILIST_URL = 'https://graphql.anilist.co'

type AniListTitle = { romaji: string | null; english: string | null }

type AniListDate = { year: number | null; month: number | null; day: number | null }

type AniListSummary = {
  id: number
  title: AniListTitle
  coverImage: { large: string | null }
  startDate: AniListDate
}

type AniListDetails = AniListSummary & {
  description: string | null
  genres: string[]
  episodes: number | null
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

const DETAILS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english }
      coverImage { large }
      startDate { year month day }
      description(asHtml: false)
      genres
      episodes
    }
  }
`

function isoDate({ year, month, day }: AniListDate) {
  if (!year) return null
  if (!month) return String(year)
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`
  return day ? `${yearMonth}-${String(day).padStart(2, '0')}` : yearMonth
}

// Even with asHtml: false, AniList descriptions contain <br>/<i> tags and HTML entities.
function plainText(html: string | null) {
  if (!html) return null
  const text = new DOMParser().parseFromString(html.replace(/<br\s*\/?>/gi, '\n'), 'text/html').body.textContent
  return text.replace(/\n{3,}/g, '\n\n').trim() || null
}

function toSummary(media: AniListSummary): MediaSummary & { type: 'anime' } {
  return {
    id: String(media.id),
    type: 'anime',
    title: titleOf(media.title),
    coverUrl: media.coverImage.large,
    releaseYear: media.startDate.year,
  }
}

export async function getAnimeDetails(id: string, signal?: AbortSignal): Promise<AnimeDetails> {
  const { Media: media } = await anilist<{ Media: AniListDetails }>(DETAILS_QUERY, { id: Number(id) }, signal)
  return {
    ...toSummary(media),
    description: plainText(media.description),
    genres: media.genres,
    releaseDate: isoDate(media.startDate),
    episodeCount: media.episodes,
  }
}

export async function searchAnime(query: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  const data = await anilist<{ Page: { media: AniListSummary[] } }>(SEARCH_QUERY, { search: query }, signal)
  return data.Page.media.map(toSummary)
}
