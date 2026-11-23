import type { GameDetails, GameHome, MediaSummary } from './media'

const RAWG_URL = 'https://api.rawg.io/api'

type RawgSummary = {
  id: number
  name: string
  background_image: string | null
  released: string | null
  metacritic: number | null
  /** User rating out of 5; 0 when nobody has rated it. */
  rating: number
  ratings_count?: number
  genres?: { name: string }[]
}

type RawgDetails = RawgSummary & {
  background_image_additional: string | null
  description_raw: string | null
  genres: { name: string }[]
  platforms: { platform: { name: string } }[] | null
}

async function rawg<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const key = import.meta.env.VITE_RAWG_API_KEY
  if (!key) throw new Error('Missing VITE_RAWG_API_KEY. Add a RAWG API key to .env.')

  const response = await fetch(`${RAWG_URL}${path}?${new URLSearchParams({ ...params, key })}`, { signal })
  if (!response.ok) throw new Error(`RAWG request failed (${response.status})`)
  return (await response.json()) as T
}

// RAWG images are full-size screenshots; its CDN serves resized copies under /media/resize/<width>/-/.
function resized(url: string | null, width: number) {
  return url?.replace(/media\.rawg\.io\/media\/(games|screenshots)\//, `media.rawg.io/media/resize/${width}/-/$1/`) ?? null
}

function yearOf(date: string | null) {
  return date ? Number(date.slice(0, 4)) : null
}

/** Metacritic when RAWG has it, otherwise the user rating scaled to 100. */
function scoreOf(game: RawgSummary) {
  return game.metacritic ?? (game.rating > 0 ? Math.round(game.rating * 20) : null)
}

function toSummary(game: RawgSummary): MediaSummary & { type: 'game' } {
  return {
    id: String(game.id),
    type: 'game',
    title: game.name,
    coverUrl: resized(game.background_image, 640),
    // RAWG's dominant_color is a placeholder ("0f0f0f") for most games, so it isn't worth using.
    coverColor: null,
    releaseYear: yearOf(game.released),
    score: scoreOf(game),
    category: game.genres?.[0]?.name ?? null,
  }
}

export async function getGameDetails(id: string, signal?: AbortSignal): Promise<GameDetails> {
  const game = await rawg<RawgDetails>(`/games/${encodeURIComponent(id)}`, {}, signal)
  return {
    ...toSummary(game),
    bannerUrl: resized(game.background_image_additional ?? game.background_image, 1280),
    description: game.description_raw?.trim() || null,
    genres: game.genres.map((genre) => genre.name),
    releaseDate: game.released,
    platforms: game.platforms?.map((entry) => entry.platform.name) ?? [],
  }
}

export async function searchGames(query: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  const data = await rawg<{ results: RawgSummary[] }>(
    '/games',
    { search: query, search_precise: 'true', page_size: '24' },
    signal,
  )
  return data.results.map(toSummary)
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

// Metacritic's top list includes duplicate re-releases nobody has rated; keep titles players actually track.
const MIN_RATINGS_FOR_TOP = 100

export async function getGameHome(signal?: AbortSignal, today = new Date()): Promise<GameHome> {
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(today.getMonth() - 6)
  const [trending, top] = await Promise.all([
    rawg<{ results: RawgSummary[] }>(
      '/games',
      { dates: `${isoDay(sixMonthsAgo)},${isoDay(today)}`, ordering: '-added', page_size: '8' },
      signal,
    ),
    rawg<{ results: RawgSummary[] }>('/games', { ordering: '-metacritic', page_size: '25' }, signal),
  ])
  return {
    trending: trending.results.map(toSummary),
    top: top.results
      .filter((game) => (game.ratings_count ?? 0) >= MIN_RATINGS_FOR_TOP)
      .slice(0, 10)
      .map(toSummary),
  }
}
