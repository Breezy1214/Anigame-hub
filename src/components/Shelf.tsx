import { useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AsyncState } from '../hooks/useAsync'
import type { MediaSummary, MediaType } from '../lib/media'
import { mediaPath } from '../lib/paths'
import Cover from './Cover'
import FormError from './FormError'
import MediaCard, { MediaMeta } from './MediaCard'

type SectionProps = {
  title: string
  type?: MediaType
  action?: ReactNode
  /** Replaces the content with an error, so one failing API leaves the rest of the page working. */
  failed?: boolean
  children: ReactNode
}

/** A home-page section: a heading (with an optional link on the right) above its content. */
export function Section({ title, type, action, failed = false, children }: SectionProps) {
  const id = useId()
  return (
    <section className="shelf" data-type={type} aria-labelledby={id}>
      <div className="shelf-head">
        <h2 id={id}>{title}</h2>
        {action}
      </div>
      {failed ? <FormError message={`Couldn’t load ${title.toLowerCase()} right now.`} /> : children}
    </section>
  )
}

type ShelfProps = { title: string; type: MediaType; state: AsyncState<MediaSummary[]> }

/** A grid of covers, with placeholders holding the space while it loads. */
export function Shelf({ title, type, state }: ShelfProps) {
  return (
    <Section title={title} type={type} failed={state.status === 'error'}>
      <ul className="media-grid" data-type={type} aria-label={title} aria-busy={state.status === 'loading'}>
        {state.status === 'success'
          ? state.data.map((media) => (
              <li key={media.id}>
                <MediaCard media={media} />
              </li>
            ))
          : Array.from({ length: 6 }, (_, i) => <li key={i} className="media-card-placeholder" />)}
      </ul>
    </Section>
  )
}

/** A numbered top-10 list; the numbers are the ranking. */
export function RankedList({ title, type, state }: ShelfProps) {
  return (
    <Section title={title} type={type} failed={state.status === 'error'}>
      {state.status === 'loading' && <p role="status">Loading…</p>}
      {state.status === 'success' && (
        <ol className="ranked-list" aria-label={title}>
          {state.data.map((media) => (
            <li key={media.id}>
              <Link to={mediaPath(media.type, media.id)}>
                <Cover url={media.coverUrl} color={media.coverColor} />
                <span className="ranked-title">{media.title}</span>
                <span className="ranked-meta">
                  <MediaMeta media={media} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}
