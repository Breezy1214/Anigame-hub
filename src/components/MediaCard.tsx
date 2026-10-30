import { Link } from 'react-router-dom'
import type { MediaSummary } from '../lib/media'

export default function MediaCard({ media }: { media: MediaSummary }) {
  return (
    <Link to={`/media/${media.type}/${media.id}`} className="media-card">
      {media.coverUrl ? (
        <img src={media.coverUrl} alt="" loading="lazy" />
      ) : (
        <div className="media-card-placeholder" aria-hidden="true" />
      )}
      <h3>{media.title}</h3>
      {media.releaseYear && <p>{media.releaseYear}</p>}
    </Link>
  )
}
