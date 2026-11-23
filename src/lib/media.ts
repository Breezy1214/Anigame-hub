export const MEDIA_TYPES = ['anime', 'game'] as const

export type MediaType = (typeof MEDIA_TYPES)[number]

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = { anime: 'Anime', game: 'Video game' }

/** Plural labels for the anime/games switch. */
export const MEDIA_TAB_LABELS: Record<MediaType, string> = { anime: 'Anime', game: 'Games' }

/** What `MediaSummary.category` holds for each type. */
export const CATEGORY_LABELS: Record<MediaType, string> = { anime: 'Format', game: 'Genre' }

export function isMediaType(value: string | null | undefined): value is MediaType {
  return MEDIA_TYPES.includes(value as MediaType)
}

export type MediaSummary = {
  id: string
  type: MediaType
  title: string
  coverUrl: string | null
  /** The cover's dominant color, shown while the image loads. */
  coverColor: string | null
  releaseYear: number | null
  /** Average user score out of 100. */
  score: number | null
  /** Anime format ("TV", "Movie") or a game's main genre. */
  category: string | null
}

type DetailsBase = MediaSummary & {
  bannerUrl: string | null
  description: string | null
  genres: string[]
  /** ISO date, possibly partial: "2023", "2023-09" or "2023-09-29". */
  releaseDate: string | null
}

export type AnimeDetails = DetailsBase & { type: 'anime'; episodeCount: number | null }

export type GameDetails = DetailsBase & { type: 'game'; platforms: string[] }

export type MediaDetails = AnimeDetails | GameDetails

/** The anime shelves on the home page, all from one AniList request. */
export type AnimeHome = { trending: MediaSummary[]; season: MediaSummary[]; seasonLabel: string; top: MediaSummary[] }

/** The game shelves on the home page. */
export type GameHome = { trending: MediaSummary[]; top: MediaSummary[] }
