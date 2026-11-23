import { Link } from 'react-router-dom'
import { useUser } from '../auth/AuthContext'
import { UserMediaFavorites, UserMediaGroup, UserMediaLoader, UserMediaRecent } from '../components/UserMediaList'
import { STATUS_GROUP_LABELS } from '../lib/tracking'
import type { UserMedia } from '../lib/userMedia'

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Dashboard({ entries }: { entries: UserMedia[] }) {
  return (
    <>
      <dl className="stats">
        <Stat label="Saved" value={entries.length} />
        <Stat label="Anime" value={entries.filter((entry) => entry.media_type === 'anime').length} />
        <Stat label="Games" value={entries.filter((entry) => entry.media_type === 'game').length} />
        <Stat label="Favorites" value={entries.filter((entry) => entry.favorite).length} />
      </dl>
      <div className="dashboard-columns">
        <UserMediaRecent entries={entries} />
        <UserMediaGroup
          title={STATUS_GROUP_LABELS.in_progress}
          entries={entries.filter((entry) => entry.status === 'in_progress')}
        />
        <UserMediaFavorites entries={entries} />
      </div>
      <p>
        <Link to="/profile">See all {entries.length} saved titles</Link>
      </p>
    </>
  )
}

/** FR-12: saved media, favorites, media in progress and recently updated titles at a glance. */
export default function DashboardPage() {
  return (
    <main className="page">
      <h1>Dashboard</h1>
      <UserMediaLoader
        userId={useUser().id}
        empty={
          <p>
            Your list is empty. <Link to="/search">Search for anime and games</Link> to start tracking.
          </p>
        }
      >
        {(entries) => <Dashboard entries={entries} />}
      </UserMediaLoader>
    </main>
  )
}
