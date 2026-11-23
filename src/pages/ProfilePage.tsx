import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../auth/AuthContext'
import FormError from '../components/FormError'
import ProfileForm from '../components/ProfileForm'
import { UserMediaByStatus, UserMediaGroup } from '../components/UserMediaList'
import { useAsync } from '../hooks/useAsync'
import { getProfile, type Profile } from '../lib/profiles'
import { listUserMedia } from '../lib/userMedia'

function ProfileSection({ initial }: { initial: Profile | null }) {
  const [profile, setProfile] = useState(initial)
  return (
    <section className="profile-header">
      {profile ? (
        <>
          <h1>{profile.display_name ?? profile.username}</h1>
          <p>@{profile.username}</p>
        </>
      ) : (
        <>
          <h1>Set up your profile</h1>
          <p>Choose a username to finish setting up your profile.</p>
        </>
      )}
      <ProfileForm profile={profile} onSaved={setProfile} />
    </section>
  )
}

/** The signed-in user's profile: their details plus saved titles, ratings, favorites and progress (FR-3). */
export default function ProfilePage() {
  const userId = useUser().id
  const profile = useAsync(`profile:${userId}`, (signal) => getProfile(userId, signal))
  const list = useAsync(`list:${userId}`, (signal) => listUserMedia(userId, signal))

  return (
    <main className="page">
      {profile.status === 'loading' && <p role="status">Loading…</p>}
      {profile.status === 'error' && <FormError message="Couldn’t load your profile. Please try again later." />}
      {profile.status === 'success' && <ProfileSection initial={profile.data} />}

      <section aria-labelledby="my-list-heading">
        <h2 id="my-list-heading">My list</h2>
        {list.status === 'error' && <FormError message="Couldn’t load your list. Please try again later." />}
        {list.status === 'success' &&
          (list.data.length === 0 ? (
            <p>
              Nothing saved yet. <Link to="/search">Find something to watch or play.</Link>
            </p>
          ) : (
            <>
              <UserMediaGroup title="Favorites" entries={list.data.filter((entry) => entry.favorite)} />
              <UserMediaByStatus entries={list.data} />
            </>
          ))}
      </section>
    </main>
  )
}
