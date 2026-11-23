import type { AnimeDetails, AnimeHome, MediaSummary } from './media'

const ANILIST_URL = 'https://graphql.anilist.co'

type AniListTitle = { romaji: string | null; english: string | null }

type AniListDate = { year: number | null; month: number | null; day: number | null }

type AniListSummary = {
  id: number
  title: AniListTitle
  coverImage: { large: string | null; color: string | null }
  startDate: AniListDate
  averageScore: number | null
  format: string | null
}

type AniListDetails = AniListSummary & {
  bannerImage: string | null
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

const SUMMARY_FIELDS = `
  id
  title { romaji english }
  coverImage { large color }
  startDate { year }
  averageScore
  format
`

const SEARCH_QUERY = `
  query ($search: String) {
    Page(perPage: 24) {
      media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) { ${SUMMARY_FIELDS} }
    }
  }
`

const HOME_QUERY = `
  query ($season: MediaSeason, $year: Int) {
    trending: Page(perPage: 12) {
      media(type: ANIME, isAdult: false, sort: TRENDING_DESC) { ${SUMMARY_FIELDS} }
    }
    season: Page(perPage: 12) {
      media(type: ANIME, isAdult: false, season: $season, seasonYear: $year, sort: POPULARITY_DESC) { ${SUMMARY_FIELDS} }
    }
    top: Page(perPage: 10) {
      media(type: ANIME, isAdult: false, sort: SCORE_DESC) { ${SUMMARY_FIELDS} }
    }
  }
`

const DETAILS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english }
      coverImage { large: extraLarge color }
      bannerImage
      startDate { year month day }
      averageScore
      format
      description(asHtml: false)
      genres
      episodes
    }
  }
`

const FORMAT_LABELS: Partial<Record<string, string>> = {
  TV: 'TV',
  TV_SHORT: 'TV short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music video',
}

const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const

/** The anime season a date falls in, as AniList names it, plus a label such as "Fall 2026". */
export function seasonOf(date: Date) {
  const season = SEASONS[Math.floor(date.getMonth() / 3)]
  const year = date.getFullYear()
  return { season, year, label: `${season[0]}${season.slice(1).toLowerCase()} ${year}` }
}

function titleOf(title: AniListTitle) {
  return title.english ?? title.romaji ?? 'Untitled'
}

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
    coverColor: media.coverImage.color,
    releaseYear: media.startDate.year,
    score: media.averageScore,
    category: media.format && (FORMAT_LABELS[media.format] ?? media.format),
  }
}

export async function getAnimeDetails(id: string, signal?: AbortSignal): Promise<AnimeDetails> {
  const { Media: media } = await anilist<{ Media: AniListDetails }>(DETAILS_QUERY, { id: Number(id) }, signal)
  return {
    ...toSummary(media),
    bannerUrl: media.bannerImage,
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

type Shelf = { media: AniListSummary[] }

export async function getAnimeHome(signal?: AbortSignal, today = new Date()): Promise<AnimeHome> {
  const { season, year, label } = seasonOf(today)
  const data = await anilist<{ trending: Shelf; season: Shelf; top: Shelf }>(HOME_QUERY, { season, year }, signal)
  return {
    trending: data.trending.media.map(toSummary),
    season: data.season.media.map(toSummary),
    seasonLabel: label,
    top: data.top.media.map(toSummary),
  }
}
