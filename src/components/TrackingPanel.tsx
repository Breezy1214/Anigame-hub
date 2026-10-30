import { useOptimistic, useState, useTransition } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { loginState } from '../auth/loginState'
import type { AsyncState } from '../hooks/useAsync'
import type { MediaSummary } from '../lib/media'
import { statusLabel, TRACKING_STATUSES, type TrackingStatus } from '../lib/tracking'
import { saveMedia, updateUserMedia, type TrackingUpdate, type UserMedia } from '../lib/userMedia'
import FormError from './FormError'

export type SavedEntry = AsyncState<UserMedia | null> | { status: 'signed-out' }

/** Runs a change against the user's list as a transition, reporting `failureMessage` if it throws. */
function useListAction(failureMessage: string) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run<T>(action: () => Promise<T>, onDone: (result: T) => void) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await action()
        startTransition(() => onDone(result))
      } catch (err) {
        console.error(err)
        setError(failureMessage)
      }
    })
  }

  return { pending, error, run }
}

function SaveButton({ media, onSaved }: { media: MediaSummary; onSaved: (entry: UserMedia) => void }) {
  const { pending, error, run } = useListAction('Couldn’t save this title. Please try again.')

  return (
    <>
      <button
        type="button"
        className="primary-button"
        onClick={() => run(() => saveMedia(media), onSaved)}
        disabled={pending}
      >
        {pending ? 'Saving…' : 'Save to my list'}
      </button>
      <FormError message={error} />
    </>
  )
}

function EntryControls({ entry, onChange }: { entry: UserMedia; onChange: (entry: UserMedia) => void }) {
  const { pending, error, run } = useListAction('Couldn’t update your list. Please try again.')
  // Show the change straight away; it reverts on its own if the update fails.
  const [shown, setShown] = useOptimistic(entry)

  function update(changes: TrackingUpdate) {
    run(() => {
      setShown({ ...entry, ...changes })
      return updateUserMedia(entry.id, changes)
    }, onChange)
  }

  return (
    <div className="entry-controls">
      <label htmlFor="tracking-status">Status</label>
      <select
        id="tracking-status"
        value={shown.status}
        disabled={pending}
        onChange={(e) => update({ status: e.target.value as TrackingStatus })}
      >
        {TRACKING_STATUSES.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status, entry.media_type)}
          </option>
        ))}
      </select>
      <FormError message={error} />
    </div>
  )
}

/** The signed-in user's tracking controls for one title. `saved` is loaded by the page alongside the details. */
export default function TrackingPanel({ media, saved }: { media: MediaSummary; saved: SavedEntry }) {
  const location = useLocation()
  const [changed, setChanged] = useState<UserMedia | null>(null)
  const entry = changed ?? (saved.status === 'success' ? saved.data : null)

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
    content = <EntryControls entry={entry} onChange={setChanged} />
  } else if (saved.status === 'success') {
    content = <SaveButton media={media} onSaved={setChanged} />
  }

  return (
    <section className="tracking-panel" aria-label="My list">
      {content}
    </section>
  )
}
