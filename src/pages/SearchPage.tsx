import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import FormError from '../components/FormError'
import MediaCard from '../components/MediaCard'
import TypeSwitch from '../components/TypeSwitch'
import { useAsync } from '../hooks/useAsync'
import { isMediaType, type MediaType } from '../lib/media'
import { searchMedia } from '../lib/mediaService'

const INPUT_LABELS: Record<MediaType, string> = { anime: 'Anime title', game: 'Game title' }

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const typeParam = searchParams.get('type')
  const type: MediaType = isMediaType(typeParam) ? typeParam : 'anime'
  const [input, setInput] = useState(query)
  const [inputQuery, setInputQuery] = useState(query)
  // Back/forward changes the query without a submit; show it in the box.
  if (inputQuery !== query) {
    setInputQuery(query)
    setInput(query)
  }
  const search = useAsync(`${type}:${query}`, query ? (signal) => searchMedia(type, query, signal) : null)

  function go(nextType: MediaType, q: string) {
    setSearchParams(q ? { type: nextType, q } : { type: nextType })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    go(type, input.trim())
  }

  return (
    <main className="page">
      <h1>Search</h1>
      <TypeSwitch value={type} onChange={(nextType) => go(nextType, query)} />
      <form className="search-form" role="search" data-type={type} onSubmit={handleSubmit}>
        <input
          type="search"
          aria-label={INPUT_LABELS[type]}
          placeholder="Search by title"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {search.status === 'loading' && <p role="status">Searching…</p>}
      {search.status === 'error' && <FormError message="Search is unavailable right now. Please try again." />}
      {search.status === 'success' &&
        (search.data.length ? (
          <ul className="media-grid" data-type={type} aria-label="Search results">
            {search.data.map((media) => (
              <li key={media.id}>
                <MediaCard media={media} />
              </li>
            ))}
          </ul>
        ) : (
          <p role="status">No results for “{query}”.</p>
        ))}
    </main>
  )
}
