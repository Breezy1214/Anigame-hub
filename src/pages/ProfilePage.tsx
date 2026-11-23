import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../auth/AuthContext'
import FormError from '../components/FormError'
import ProfileForm from '../components/ProfileForm'
import ProfileHeading from '../components/ProfileHeading'
import ShareProfileLink from '../components/ShareProfileLink'
import { UserMediaByStatus, UserMediaFavorites, UserMediaLoader } from '../components/UserMediaList'
import { useAsync } from '../hooks/useAsync'
import { publicProfilePath } from '../lib/paths'
import { getProfile, type Profile } from '../lib/profiles'

function ProfileSection({ initial }: { initial: Profile | null }) {
  const [profile, setProfile] = useState(initial)
  return (
    <section className="profile-header">
      {profile ? (
        <ProfileHeading profile={profile}>
          {profile.is_public && (
            <>
              <p>
                <Link to={publicProfilePath(profile.username)}>View public profile</Link>
              </p>
              <ShareProfileLink username={profile.username} />
            </>
          )}
        </ProfileHeading>
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

  return (
    <main className="page">
      {profile.status === 'loading' && <p role="status">Loading…</p>}
      {profile.status === 'error' && <FormError message="Couldn’t load your profile. Please try again later." />}
      {profile.status === 'success' && <ProfileSection initial={profile.data} />}

      <section aria-labelledby="my-list-heading">
        <h2 id="my-list-heading">My list</h2>
        <UserMediaLoader
          userId={userId}
          empty={
            <p>
              Nothing saved yet. <Link to="/search">Find something to watch or play.</Link>
            </p>
          }
        >
          {(entries) => (
            <>
              <UserMediaFavorites entries={entries} />
              <UserMediaByStatus entries={entries} />
            </>
          )}
        </UserMediaLoader>
      </section>
    </main>
  )
}
