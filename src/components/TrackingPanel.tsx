import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { loginState } from '../auth/loginState'
import type { AsyncState } from '../hooks/useAsync'
import type { MediaSummary } from '../lib/media'
import { saveMedia, type UserMedia } from '../lib/userMedia'
import FormError from './FormError'

export type SavedEntry = AsyncState<UserMedia | null> | { status: 'signed-out' }

function SaveButton({ media, onSaved }: { media: MediaSummary; onSaved: (entry: UserMedia) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      onSaved(await saveMedia(media))
    } catch (err) {
      console.error(err)
      setError('Couldn’t save this title. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save to my list'}
      </button>
      <FormError message={error} />
    </>
  )
}

/** The signed-in user's tracking controls for one title. `saved` is loaded by the page alongside the details. */
export default function TrackingPanel({ media, saved }: { media: MediaSummary; saved: SavedEntry }) {
  const location = useLocation()
  const [justSaved, setJustSaved] = useState<UserMedia | null>(null)
  const entry = justSaved ?? (saved.status === 'success' ? saved.data : null)

  let content
  if (saved.status === 'signed-out') {
    content = (
      <p>
        <Link to="/login" state={loginState(location)}>
          Log in
        </Link>{' '}
        to save this title to your list.
      </p>
    )
  } else if (saved.status === 'error') {
    content = <FormError message="Couldn’t load your list. Please try again later." />
  } else if (entry) {
    content = <p role="status">Saved to your list.</p>
  } else if (saved.status === 'success') {
    content = <SaveButton media={media} onSaved={setJustSaved} />
  }

  return (
    <section className="tracking-panel" aria-label="My list">
      {content}
    </section>
  )
}
