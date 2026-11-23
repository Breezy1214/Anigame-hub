import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEDIA_TAB_LABELS, type MediaType } from '../lib/media'
import { searchPath } from '../lib/paths'
import TypeSwitch from './TypeSwitch'

type QuickSearchProps = {
  id: string
  /** Adds the anime/games switch (the hero). Without it, searches start on the anime tab. */
  withTypePicker?: boolean
  /** Submits on Enter only, keeping the button for screen readers (the header). */
  compact?: boolean
}

/** A search box that opens the search page. */
export default function QuickSearch({ id, withTypePicker = false, compact = false }: QuickSearchProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<MediaType>('anime')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(searchPath(type, query.trim()))
  }

  return (
    <form className="quick-search" role="search" onSubmit={handleSubmit} data-type={type}>
      {withTypePicker && <TypeSwitch value={type} onChange={setType} />}
      <label htmlFor={id} className="visually-hidden">
        Search titles
      </label>
      <input
        id={id}
        type="search"
        placeholder={withTypePicker ? `Search ${MEDIA_TAB_LABELS[type].toLowerCase()} by title` : 'Search titles'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className={compact ? 'visually-hidden' : 'primary-button'}>
        Search
      </button>
    </form>
  )
}
