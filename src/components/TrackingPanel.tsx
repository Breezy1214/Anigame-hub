import { useOptimistic, useState, useTransition } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { loginState } from '../auth/loginState'
import type { AsyncState } from '../hooks/useAsync'
import type { MediaDetails, MediaSummary } from '../lib/media'
import {
  clampProgress,
  PROGRESS_LABELS,
  progressLimit,
  progressSuffix,
  MAX_RATING,
  RATINGS,
  statusLabel,
  TRACKING_STATUSES,
  type TrackingStatus,
} from '../lib/tracking'
import { deleteUserMedia, saveMedia, updateUserMedia, type TrackingUpdate, type UserMedia } from '../lib/userMedia'
import Field from './Field'
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

type ProgressFieldProps = {
  value: number
  label: string
  suffix: string | null
  limit: number | null
  disabled: boolean
  onCommit: (progress: number) => void
}

/** Commits on Enter or blur, so typing a multi-digit number makes one update. */
function ProgressField({ value, label, suffix, limit, disabled, onCommit }: ProgressFieldProps) {
  const [draft, setDraft] = useState(String(value))

  function commit() {
    const next = clampProgress(draft, limit)
    setDraft(String(next))
    if (next !== value) onCommit(next)
  }

  return (
    <div className="progress-field">
      <Field
        id="tracking-progress"
        label={label}
        type="number"
        inputMode="numeric"
        min={0}
        max={limit ?? undefined}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
      {suffix && <span>{suffix}</span>}
    </div>
  )
}

/** Asks for confirmation before removing, since removal discards the tracking data. */
function RemoveControl({ disabled, onConfirm }: { disabled: boolean; onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button type="button" className="link-button" disabled={disabled} onClick={() => setConfirming(true)}>
        Remove from list
      </button>
    )
  }
  return (
    <div className="confirm-remove" role="group" aria-label="Confirm removal">
      <span>Remove from your list? Its status, rating and progress will be lost.</span>
      <button type="button" className="primary-button danger-button" disabled={disabled} onClick={onConfirm}>
        Remove
      </button>
      <button type="button" className="link-button" disabled={disabled} onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </div>
  )
}

type EntryControlsProps = {
  entry: UserMedia
  limit: number | null
  onChange: (entry: UserMedia) => void
  onRemoved: () => void
}

function EntryControls({ entry, limit, onChange, onRemoved }: EntryControlsProps) {
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
      <button
        type="button"
        className="favorite-button"
        aria-pressed={shown.favorite}
        disabled={pending}
        onClick={() => update({ favorite: !shown.favorite })}
      >
        <span aria-hidden="true">{shown.favorite ? '★' : '☆'}</span> Favorite
      </button>
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
      <label htmlFor="tracking-rating">Rating</label>
      <select
        id="tracking-rating"
        value={shown.rating ?? ''}
        disabled={pending}
        onChange={(e) => update({ rating: e.target.value ? Number(e.target.value) : null })}
      >
        <option value="">Not rated</option>
        {RATINGS.map((rating) => (
          <option key={rating} value={rating}>
            {rating} / {MAX_RATING}
          </option>
        ))}
      </select>
      <ProgressField
        // Remount when the shown value changes (saved or rolled back) so the draft follows it.
        key={shown.progress}
        value={shown.progress}
        label={PROGRESS_LABELS[entry.media_type]}
        suffix={progressSuffix(entry.media_type, limit)}
        limit={limit}
        disabled={pending}
        onCommit={(progress) => update({ progress })}
      />
      <RemoveControl disabled={pending} onConfirm={() => run(() => deleteUserMedia(entry.id), onRemoved)} />
      <FormError message={error} />
    </div>
  )
}

/** Mounted once the user's entry has loaded, so local state can start from it. */
function SavedControls({ media, initial }: { media: MediaDetails; initial: UserMedia | null }) {
  const [entry, setEntry] = useState(initial)
  if (!entry) return <SaveButton media={media} onSaved={setEntry} />
  return (
    <EntryControls
      entry={entry}
      limit={progressLimit(media)}
      onChange={setEntry}
      onRemoved={() => setEntry(null)}
    />
  )
}

/** The signed-in user's tracking controls for one title. `saved` is loaded by the page alongside the details. */
export default function TrackingPanel({ media, saved }: { media: MediaDetails; saved: SavedEntry }) {
  const location = useLocation()

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
  } else if (saved.status === 'success') {
    content = <SavedControls media={media} initial={saved.data} />
  }

  return (
    <section className="tracking-panel" aria-label="My list">
      {content}
    </section>
  )
}
