import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Cover from '../components/Cover'
import FormError from '../components/FormError'
import { Score } from '../components/MediaCard'
import TrackingPanel, { type SavedEntry } from '../components/TrackingPanel'
import { useAsync } from '../hooks/useAsync'
import { formatReleaseDate } from '../lib/format'
import { CATEGORY_LABELS, isMediaType, MEDIA_TYPE_LABELS, type MediaDetails } from '../lib/media'
import { getMediaDetails } from '../lib/mediaService'
import { findUserMedia } from '../lib/userMedia'

function Row({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === '') return null
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  )
}

function DetailsView({ media, saved }: { media: MediaDetails; saved: SavedEntry }) {
  // Anime without a banner, and every game, fall back to the cover art blurred behind the header.
  const backdrop = media.bannerUrl ?? media.coverUrl

  return (
    <article className="media-details" data-type={media.type}>
      <div className="details-banner" aria-hidden="true">
        {backdrop && <img src={backdrop} alt="" data-blur={!media.bannerUrl || undefined} />}
      </div>
      <header className="details-head">
        <Cover
          url={media.coverUrl}
          color={media.coverColor}
          alt={`Cover of ${media.title}`}
          className="details-cover"
          loading="eager"
        />
        <div className="details-title">
          <p className="type-tag">{MEDIA_TYPE_LABELS[media.type]}</p>
          <h1>{media.title}</h1>
          {media.genres.length > 0 && (
            <ul className="chips" aria-label="Genres">
              {media.genres.map((genre) => (
                <li key={genre}>{genre}</li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <div className="details-body">
        <aside>
          <TrackingPanel media={media} saved={saved} />
          <dl className="facts">
            <Row label="Average score" value={media.score === null ? null : <Score score={media.score} />} />
            <Row label={CATEGORY_LABELS[media.type]} value={media.category} />
            <Row label="Released" value={media.releaseDate && formatReleaseDate(media.releaseDate)} />
            {media.type === 'anime' ? (
              <Row label="Episodes" value={media.episodeCount ?? 'Unknown'} />
            ) : (
              <Row label="Platforms" value={media.platforms.join(', ')} />
            )}
          </dl>
        </aside>
        <div className="media-description">
          <h2>About</h2>
          <p>{media.description ?? 'No description available.'}</p>
        </div>
      </div>
    </article>
  )
}

export default function MediaDetailsPage() {
  const { type, id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const details = useAsync(
    `${type}:${id}`,
    isMediaType(type) && id ? (signal) => getMediaDetails(type, id, signal) : null,
  )
  // Looked up in parallel with the details rather than after them.
  const entry = useAsync(
    `${user?.id}:${type}:${id}`,
    user && isMediaType(type) && id ? (signal) => findUserMedia(user.id, type, id, signal) : null,
  )
  const saved: SavedEntry = authLoading ? { status: 'loading' } : user ? entry : { status: 'signed-out' }

  return (
    <main className={details.status === 'success' ? 'details-page' : 'page'}>
      {details.status === 'idle' && <FormError message="This title doesn’t exist." />}
      {details.status === 'loading' && <p role="status">Loading…</p>}
      {details.status === 'error' && <FormError message="Couldn’t load this title. Please try again later." />}
      {details.status === 'success' && <DetailsView media={details.data} saved={saved} />}
    </main>
  )
}
