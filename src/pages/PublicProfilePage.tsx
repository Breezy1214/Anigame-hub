import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import FormError from '../components/FormError'
import ProfileHeading from '../components/ProfileHeading'
import { UserMediaByStatus, UserMediaFavorites, UserMediaLoader, UserMediaRecent } from '../components/UserMediaList'
import { useAsync } from '../hooks/useAsync'
import { getProfileByUsername, type Profile } from '../lib/profiles'

function PublicProfile({ profile }: { profile: Profile }) {
  const isOwner = useAuth().user?.id === profile.id

  return (
    <>
      <header className="profile-header">
        <ProfileHeading profile={profile}>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          {isOwner && !profile.is_public && (
            <p role="status">Your profile is private, so only you can see this page.</p>
          )}
        </ProfileHeading>
      </header>
      <UserMediaLoader userId={profile.id} empty={<p>Nothing on this list yet.</p>}>
        {(entries) => (
          <>
            {/* FR-14 "current activity". */}
            <UserMediaRecent entries={entries} />
            <UserMediaFavorites entries={entries} />
            <h2>Lists</h2>
            <UserMediaByStatus entries={entries} />
          </>
        )}
      </UserMediaLoader>
    </>
  )
}

/** FR-14: anyone can view a public profile's lists, ratings, favorites and current activity. */
export default function PublicProfilePage() {
  const { username = '' } = useParams()
  const profile = useAsync(`profile:${username}`, (signal) => getProfileByUsername(username, signal))
  const found = profile.status === 'success' ? profile.data : null

  return (
    <main className="page">
      {profile.status === 'loading' && <p role="status">Loading…</p>}
      {profile.status === 'error' && <FormError message="Couldn’t load this profile. Please try again later." />}
      {profile.status === 'success' && !found && <FormError message="This profile doesn’t exist or isn’t public." />}
      {found && <PublicProfile profile={found} />}
    </main>
  )
}
