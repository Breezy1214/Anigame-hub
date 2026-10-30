import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import FormError from '../components/FormError'
import MediaCard from '../components/MediaCard'
import { searchAnime } from '../lib/animeApi'
import type { MediaSummary } from '../lib/media'

// `results` is null when the search failed.
type SearchResult = { query: string; results: MediaSummary[] | null }

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const [input, setInput] = useState(query)
  const [result, setResult] = useState<SearchResult | null>(null)
  const current = result?.query === query ? result : null

  useEffect(() => {
    if (!query) return
    const controller = new AbortController()
    searchAnime(query, controller.signal)
      .then((results) => setResult({ query, results }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ query, results: null })
      })
    return () => controller.abort()
  }, [query])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = input.trim()
    setSearchParams(q ? { q } : {})
  }

  return (
    <main className="page">
      <h1>Search anime</h1>
      <form className="search-form" role="search" onSubmit={handleSubmit}>
        <input
          type="search"
          aria-label="Anime title"
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
