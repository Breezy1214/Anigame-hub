import { Link } from 'react-router-dom'
import type { MediaSummary } from '../lib/media'
import { mediaPath } from '../lib/paths'
import Cover from './Cover'

export default function MediaCard({ media }: { media: MediaSummary }) {
  return (
    <Link to={mediaPath(media.type, media.id)} className="media-card">
      <Cover url={media.coverUrl} />
      <h3>{media.title}</h3>
      {media.releaseYear && <p>{media.releaseYear}</p>}
    </Link>
  )
}
