import { useState } from 'react'
import { publicProfilePath } from '../lib/paths'

/** FR-15: the shareable URL for a public profile, with copy and (where supported) native share. */
export default function ShareProfileLink({ username }: { username: string }) {
  const url = new URL(publicProfilePath(username), window.location.origin).href
  const [status, setStatus] = useState<string | null>(null)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setStatus('Link copied.')
    } catch {
      setStatus('Couldn’t copy automatically. Select the link and copy it.')
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title: `@${username} on AniGame Hub`, url })
    } catch {
      // Cancelling the share sheet rejects too; nothing to report.
    }
  }

  return (
    <div className="share-link">
      <label htmlFor="profile-link">Share your profile</label>
      <div className="share-link-row">
        <input id="profile-link" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="primary-button" onClick={handleCopy}>
          Copy link
        </button>
        {'share' in navigator && (
          <button type="button" className="link-button" onClick={handleShare}>
            Share…
          </button>
        )}
      </div>
      {status && <p role="status">{status}</p>}
    </div>
  )
}
