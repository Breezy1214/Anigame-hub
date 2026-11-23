import { Link } from 'react-router-dom'
import type { MediaSummary } from '../lib/media'
import { mediaPath } from '../lib/paths'
import Cover from './Cover'

const FAN_SIZE = 5
const CENTER = Math.floor(FAN_SIZE / 2)

/** Alternates trending anime and games (anime first), so the fan shows both halves of the site. */
function interleave(anime: MediaSummary[], games: MediaSummary[]) {
  return Array.from({ length: FAN_SIZE }, (_, i) => [anime[i], games[i]])
    .flat()
    .filter(Boolean)
    .slice(0, FAN_SIZE)
}

/** The hero's hand of trending covers, fanned like playing cards. Empty slots hold their place while loading. */
export default function CoverFan({ anime, games }: { anime: MediaSummary[]; games: MediaSummary[] }) {
  const covers = interleave(anime, games)
  return (
    <div className="cover-fan">
      {Array.from({ length: FAN_SIZE }, (_, i) => {
        const media = covers[i]
        if (!media) return <span key={i} className="fan-card" aria-hidden="true" />
        return (
          <Link key={i} to={mediaPath(media.type, media.id)} className="fan-card" data-type={media.type}>
            {/* Above the fold, so load straight away; the center card is the page's largest image. */}
            <Cover
              url={media.coverUrl}
              color={media.coverColor}
              loading="eager"
              fetchPriority={i === CENTER ? 'high' : undefined}
            />
            <span className="visually-hidden">{media.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
