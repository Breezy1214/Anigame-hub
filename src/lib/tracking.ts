import type { MediaDetails, MediaType } from './media'

export const TRACKING_STATUSES = ['completed', 'in_progress', 'planned', 'dropped'] as const

export type TrackingStatus = (typeof TRACKING_STATUSES)[number]

const STATUS_LABELS: Record<TrackingStatus, Record<MediaType, string>> = {
  completed: { anime: 'Watched', game: 'Played' },
  in_progress: { anime: 'In Progress', game: 'In Progress' },
  planned: { anime: 'Plan to Watch', game: 'Plan to Play' },
  dropped: { anime: 'Dropped', game: 'Dropped' },
}

export function statusLabel(status: TrackingStatus, type: MediaType) {
  return STATUS_LABELS[status][type]
}

/** Anime progress is episodes watched; game progress is percent complete. */
export const PROGRESS_LABELS: Record<MediaType, string> = { anime: 'Episodes watched', game: 'Completion (%)' }

/** Text shown after the progress input, e.g. "of 26" episodes. */
export function progressSuffix(type: MediaType, limit: number | null) {
  return type === 'anime' && limit !== null ? `of ${limit}` : null
}

/** The highest progress a title allows, or null when unknown (e.g. an airing anime). */
export function progressLimit(media: MediaDetails) {
  return media.type === 'anime' ? media.episodeCount : 100
}

/** Parses typed progress into a whole number within the title's limit. */
export function clampProgress(input: string, limit: number | null) {
  return Math.min(Math.max(0, Math.floor(Number(input)) || 0), limit ?? Infinity)
}
