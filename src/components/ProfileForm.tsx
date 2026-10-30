import { useState, type FormEvent } from 'react'
import { saveProfile, type Profile, type SaveProfileResult } from '../lib/profiles'
import { validateUsername } from '../lib/validation'
import Field from './Field'
import FormError from './FormError'

export default function ProfileForm({ profile, onSaved }: { profile: Profile | null; onSaved: (p: Profile) => void }) {
  const [username, setUsername] = useState(profile?.username ?? '')
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [outcome, setOutcome] = useState<SaveProfileResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submitLabel = profile ? 'Save profile' : 'Create profile'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateUsername(username)
    if (validationError) {
      setOutcome({ status: 'error', message: validationError })
      return
    }

    setSubmitting(true)
    const result = await saveProfile({ username, display_name: displayName.trim() || null, bio: bio.trim() || null })
    setSubmitting(false)
    setOutcome(result)
    if (result.status === 'saved') onSaved(result.profile)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <Field
        id="username"
        label="Username"
        autoComplete="username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
      />
      <Field
        id="display-name"
        label="Display name"
        maxLength={50}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <label htmlFor="bio">Bio</label>
      <textarea id="bio" maxLength={500} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />

      <FormError message={outcome?.status === 'error' ? outcome.message : null} />
      {outcome?.status === 'saved' && <p role="status">Profile saved.</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
