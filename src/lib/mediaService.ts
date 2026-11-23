import { searchAnime } from './animeApi'
import { searchGames } from './gameApi'
import type { MediaSummary, MediaType } from './media'

const searchers = { anime: searchAnime, game: searchGames }

export function searchMedia(type: MediaType, query: string, signal?: AbortSignal): Promise<MediaSummary[]> {
  return searchers[type](query, signal)
}
