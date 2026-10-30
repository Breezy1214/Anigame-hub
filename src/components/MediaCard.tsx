import { Link } from 'react-router-dom'
import { mediaPath, type MediaSummary } from '../lib/media'
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
