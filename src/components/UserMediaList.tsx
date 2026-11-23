import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../hooks/useAsync'
import { MEDIA_TYPE_LABELS } from '../lib/media'
import { mediaPath } from '../lib/paths'
import { formatProgress, formatRating, STATUS_GROUP_LABELS, TRACKING_STATUSES } from '../lib/tracking'
import { listUserMedia, type UserMedia } from '../lib/userMedia'
import Cover from './Cover'
import FormError from './FormError'

function UserMediaItem({ entry }: { entry: UserMedia }) {
  const details = [
    MEDIA_TYPE_LABELS[entry.media_type],
    entry.rating !== null && formatRating(entry.rating),
    formatProgress(entry.progress, entry.media_type),
  ].filter(Boolean)

  return (
    <li className="user-media-item">
      <Link to={mediaPath(entry.media_type, entry.external_media_id)}>
        <Cover url={entry.cover_url} />
        <span className="user-media-title">
          {entry.title}
          {entry.favorite && (
            <span className="favorite-mark" role="img" aria-label="Favorite">
              ★
            </span>
          )}
        </span>
        <span className="user-media-details">{details.join(' · ')}</span>
      </Link>
    </li>
  )
}

/** A titled section of a user's list, with a count; renders nothing when empty. */
export function UserMediaGroup({ title, entries }: { title: string; entries: UserMedia[] }) {
  if (entries.length === 0) return null
  return (
    <section className="user-media-group">
      <h3>
        {title} <span className="count">({entries.length})</span>
      </h3>
      <ul className="user-media-list" aria-label={title}>
        {entries.map((entry) => (
          <UserMediaItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  )
}

/** A user's list split into one section per tracking status, skipping empty statuses. */
export function UserMediaByStatus({ entries }: { entries: UserMedia[] }) {
  return TRACKING_STATUSES.map((status) => (
    <UserMediaGroup
      key={status}
      title={STATUS_GROUP_LABELS[status]}
      entries={entries.filter((entry) => entry.status === status)}
    />
  ))
}

const RECENT_LIMIT = 5

/** The most recently changed titles; `entries` must be most recently updated first (as listUserMedia returns them). */
export function UserMediaRecent({ entries }: { entries: UserMedia[] }) {
  return <UserMediaGroup title="Recently updated" entries={entries.slice(0, RECENT_LIMIT)} />
}

export function UserMediaFavorites({ entries }: { entries: UserMedia[] }) {
  return <UserMediaGroup title="Favorites" entries={entries.filter((entry) => entry.favorite)} />
}

type UserMediaLoaderProps = {
  userId: string
  /** Shown when the list loads but has nothing in it. */
  empty: ReactNode
  children: (entries: UserMedia[]) => ReactNode
}

/** Loads a user's list and handles the loading, error and empty states for pages that show it. */
export function UserMediaLoader({ userId, empty, children }: UserMediaLoaderProps) {
  const list = useAsync(`list:${userId}`, (signal) => listUserMedia(userId, signal))

  if (list.status === 'error') return <FormError message="Couldn’t load this list. Please try again later." />
  if (list.status !== 'success') return <p role="status">Loading…</p>
  return list.data.length === 0 ? empty : children(list.data)
}
