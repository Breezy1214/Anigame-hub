import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import FormError from '../components/FormError'
import { useAsync } from '../hooks/useAsync'
import { formatReleaseDate } from '../lib/format'
import { isMediaType, MEDIA_TYPE_LABELS, type MediaDetails } from '../lib/media'
import { getMediaDetails } from '../lib/mediaService'

function Row({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === '') return null
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  )
}

function DetailsView({ media }: { media: MediaDetails }) {
  return (
    <article className="media-details">
      {media.coverUrl && <img src={media.coverUrl} alt={`Cover of ${media.title}`} />}
      <div>
        <h1>{media.title}</h1>
        <dl>
          <Row label="Type" value={MEDIA_TYPE_LABELS[media.type]} />
          <Row label="Released" value={media.releaseDate && formatReleaseDate(media.releaseDate)} />
          <Row label="Genres" value={media.genres.join(', ')} />
          {media.type === 'anime' ? (
            <Row label="Episodes" value={media.episodeCount ?? 'Unknown'} />
          ) : (
            <Row label="Platforms" value={media.platforms.join(', ')} />
          )}
        </dl>
        <p className="media-description">{media.description ?? 'No description available.'}</p>
      </div>
    </article>
  )
}

export default function MediaDetailsPage() {
  const { type, id } = useParams()
  const details = useAsync(
    `${type}:${id}`,
    isMediaType(type) && id ? (signal) => getMediaDetails(type, id, signal) : null,
  )

  return (
    <main className="page">
      {details.status === 'idle' && <FormError message="This title doesn’t exist." />}
      {details.status === 'loading' && <p role="status">Loading…</p>}
      {details.status === 'error' && <FormError message="Couldn’t load this title. Please try again later." />}
      {details.status === 'success' && <DetailsView media={details.data} />}
    </main>
  )
}
