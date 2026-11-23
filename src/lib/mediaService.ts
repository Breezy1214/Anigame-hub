import { getAnimeDetails, getAnimeHome as fetchAnimeHome, searchAnime } from './animeApi'
import { getGameDetails, getGameHome as fetchGameHome, searchGames } from './gameApi'
import type { AnimeHome, GameHome, MediaDetails, MediaSummary, MediaType } from './media'

const apis = {
  anime: { search: searchAnime, details: getAnimeDetails },
  game: { search: searchGames, details: getGameDetails },
}

// Catalog data rarely changes, so keep recent responses to avoid refetching on back/forward and tab switches.
const CACHE_LIMIT = 100
const cache = new Map<string, unknown>()

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  // Re-inserting on every hit keeps Map order least-recently-used first, so eviction drops the stalest entry.
  const value = cache.has(key) ? (cache.get(key) as T) : await load()
  cache.delete(key)
  cache.set(key, value)
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value!)
  return value
}

export function searchMedia(type: MediaType, query: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  return cached<MediaSummary[]>(`search:${type}:${query.toLowerCase()}`, () => apis[type].search(query, signal))
}

export function getMediaDetails(type: MediaType, id: string, signal?: AbortSignal): Promise<MediaDetails> {
  return cached<MediaDetails>(`details:${type}:${id}`, () => apis[type].details(id, signal))
}

export function getAnimeHome(signal?: AbortSignal): Promise<AnimeHome> {
  return cached('home:anime', () => fetchAnimeHome(signal))
}

export function getGameHome(signal?: AbortSignal): Promise<GameHome> {
  return cached('home:game', () => fetchGameHome(signal))
}
