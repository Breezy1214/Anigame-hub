import type { GameDetails, MediaSummary } from './media'

const RAWG_URL = 'https://api.rawg.io/api'

type RawgSummary = {
  id: number
  name: string
  background_image: string | null
  released: string | null
}

type RawgDetails = RawgSummary & {
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

// RAWG covers are full-size screenshots; its CDN serves resized copies under /media/resize/.
function thumbnailOf(url: string | null) {
  return url?.replace('media.rawg.io/media/games/', 'media.rawg.io/media/resize/640/-/games/') ?? null
}

function yearOf(date: string | null) {
  return date ? Number(date.slice(0, 4)) : null
}

function toSummary(game: RawgSummary): MediaSummary & { type: 'game' } {
  return {
    id: String(game.id),
    type: 'game',
    title: game.name,
    coverUrl: thumbnailOf(game.background_image),
    releaseYear: yearOf(game.released),
  }
}

export async function getGameDetails(id: string, signal?: AbortSignal): Promise<GameDetails> {
  const game = await rawg<RawgDetails>(`/games/${encodeURIComponent(id)}`, {}, signal)
  return {
    ...toSummary(game),
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
