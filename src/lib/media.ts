export const MEDIA_TYPES = ['anime', 'game'] as const

export type MediaType = (typeof MEDIA_TYPES)[number]

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = { anime: 'Anime', game: 'Video game' }

/** The details page for a title (see the /media/:type/:id route). */
export function mediaPath(type: MediaType, id: string) {
  return `/media/${type}/${id}`
}

export function isMediaType(value: string | null | undefined): value is MediaType {
  return MEDIA_TYPES.includes(value as MediaType)
}

export type MediaSummary = {
  id: string
  type: MediaType
  title: string
  coverUrl: string | null
  releaseYear: number | null
}

type DetailsBase = MediaSummary & {
  description: string | null
  genres: string[]
  /** ISO date, possibly partial: "2023", "2023-09" or "2023-09-29". */
  releaseDate: string | null
}

export type AnimeDetails = DetailsBase & { type: 'anime'; episodeCount: number | null }

export type GameDetails = DetailsBase & { type: 'game'; platforms: string[] }

export type MediaDetails = AnimeDetails | GameDetails
