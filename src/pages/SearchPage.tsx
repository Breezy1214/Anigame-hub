import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import FormError from '../components/FormError'
import MediaCard from '../components/MediaCard'
import type { MediaSummary, MediaType } from '../lib/media'
import { searchMedia } from '../lib/mediaService'

// `results` is null when the search failed.
type SearchResult = { key: string; results: MediaSummary[] | null }

const TABS: { type: MediaType; label: string; inputLabel: string }[] = [
  { type: 'anime', label: 'Anime', inputLabel: 'Anime title' },
  { type: 'game', label: 'Games', inputLabel: 'Game title' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const tab = TABS.find((t) => t.type === searchParams.get('type')) ?? TABS[0]
  const type = tab.type
  const key = `${type}:${query}`
  const [input, setInput] = useState(query)
  const [result, setResult] = useState<SearchResult | null>(null)
  const current = result?.key === key ? result : null

  useEffect(() => {
    if (!query) return
    const controller = new AbortController()
    searchMedia(type, query, controller.signal)
      .then((results) => setResult({ key, results }))
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error(error)
        setResult({ key, results: null })
      })
    return () => controller.abort()
  }, [type, query])

  function search(nextType: MediaType, q: string) {
    setSearchParams(q ? { type: nextType, q } : { type: nextType })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    search(type, input.trim())
  }

  return (
    <main className="page">
      <h1>Search</h1>
      <div className="tabs" role="group" aria-label="Media type">
        {TABS.map((t) => (
          <button key={t.type} type="button" aria-pressed={t.type === type} onClick={() => search(t.type, query)}>
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

      {query && !current && <p role="status">Searching…</p>}
      {current?.results === null && <FormError message="Search is unavailable right now. Please try again." />}
      {current?.results?.length === 0 && <p role="status">No results for “{query}”.</p>}
      {!!current?.results?.length && (
        <ul className="media-grid" aria-label="Search results">
          {current.results.map((media) => (
            <li key={media.id}>
              <MediaCard media={media} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
