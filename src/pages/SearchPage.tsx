import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import FormError from '../components/FormError'
import MediaCard from '../components/MediaCard'
import { useAsync } from '../hooks/useAsync'
import type { MediaType } from '../lib/media'
import { searchMedia } from '../lib/mediaService'

const TABS: { type: MediaType; label: string; inputLabel: string }[] = [
  { type: 'anime', label: 'Anime', inputLabel: 'Anime title' },
  { type: 'game', label: 'Games', inputLabel: 'Game title' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const tab = TABS.find((t) => t.type === searchParams.get('type')) ?? TABS[0]
  const type = tab.type
  const [input, setInput] = useState(query)
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
      <div className="tabs" role="group" aria-label="Media type">
        {TABS.map((t) => (
          <button key={t.type} type="button" aria-pressed={t.type === type} onClick={() => go(t.type, query)}>
            {t.label}
          </button>
        ))}
      </div>
      <form className="search-form" role="search" onSubmit={handleSubmit}>
        <input
          type="search"
          aria-label={tab.inputLabel}
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
          <ul className="media-grid" aria-label="Search results">
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
