import { Link } from 'react-router-dom'
import type { MediaSummary } from '../lib/media'
import { mediaPath } from '../lib/paths'
import Cover from './Cover'

export function Score({ score }: { score: number | null }) {
  if (score === null) return null
  return (
    <span className="score" title="Average score">
      {score}%
    </span>
  )
}

/** A title's category, year and score, each only when known. */
export function MediaMeta({ media }: { media: MediaSummary }) {
  return (
    <>
      {media.category && <span>{media.category}</span>}
      {media.releaseYear && <span>{media.releaseYear}</span>}
      <Score score={media.score} />
    </>
  )
}

/** A cover with its title underneath. Anime covers are portrait posters, game covers landscape screenshots. */
export default function MediaCard({ media }: { media: MediaSummary }) {
  return (
    <Link to={mediaPath(media.type, media.id)} className="media-card" data-type={media.type}>
      <Cover url={media.coverUrl} color={media.coverColor} />
      <h3>{media.title}</h3>
      <p className="media-card-meta">
        <MediaMeta media={media} />
      </p>
    </Link>
  )
}
