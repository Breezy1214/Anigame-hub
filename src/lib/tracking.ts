import type { MediaType } from './media'

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
