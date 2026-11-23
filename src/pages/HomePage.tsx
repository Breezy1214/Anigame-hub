import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import CoverFan from '../components/CoverFan'
import QuickSearch from '../components/QuickSearch'
import { RankedList, Section, Shelf } from '../components/Shelf'
import { UserMediaItem } from '../components/UserMediaList'
import { mapAsync, useAsync } from '../hooks/useAsync'
import { getAnimeHome, getGameHome } from '../lib/mediaService'
import { listInProgress } from '../lib/userMedia'

const CONTINUE_LIMIT = 6

/** The signed-in user's titles in progress; renders nothing until there is something to continue. */
function ContinueSection({ userId }: { userId: string }) {
  const current = useAsync(`in-progress:${userId}`, (signal) => listInProgress(userId, CONTINUE_LIMIT, signal))
  if (current.status !== 'success' || current.data.length === 0) return null

  return (
    <Section title="Pick up where you left off" action={<Link to="/dashboard">Your dashboard</Link>}>
      <ul className="user-media-list continue-list" aria-label="In progress">
        {current.data.map((entry) => (
          <UserMediaItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </Section>
  )
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const anime = useAsync('home:anime', getAnimeHome)
  const games = useAsync('home:games', getGameHome)
  const seasonLabel = anime.status === 'success' ? anime.data.seasonLabel : 'this season'

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <h1>Your watchlist and your backlog, in one place.</h1>
          <p>Track every episode and every playthrough, score what you finish, and share your list with friends.</p>
          <QuickSearch id="hero-search" withTypePicker />
          {!loading && !user && (
            <p className="hero-actions">
              <Link to="/register" className="primary-button">
                Create a free account
              </Link>
              <Link to="/login">Log in</Link>
            </p>
          )}
        </div>
        <CoverFan
          anime={anime.status === 'success' ? anime.data.trending : []}
          games={games.status === 'success' ? games.data.trending : []}
        />
      </section>

      {user && <ContinueSection userId={user.id} />}
      <Shelf title="Trending anime" type="anime" state={mapAsync(anime, (home) => home.trending)} />
      <Shelf title="Trending games" type="game" state={mapAsync(games, (home) => home.trending)} />
      <div className="top-lists">
        <RankedList title="Top anime" type="anime" state={mapAsync(anime, (home) => home.top)} />
        <RankedList title="Top games" type="game" state={mapAsync(games, (home) => home.top)} />
      </div>
      <Shelf title={`Popular in ${seasonLabel}`} type="anime" state={mapAsync(anime, (home) => home.season)} />
    </main>
  )
}
