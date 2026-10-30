import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { signOut } from '../lib/auth'

export default function Layout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <header className="site-header">
        <nav aria-label="Main">
          <Link to="/" className="brand">
            AniGame Hub
          </Link>
          <Link to="/search">Search</Link>
          {!loading &&
            (user ? (
              <>
                <span className="nav-user">{user.email}</span>
                <button type="button" onClick={handleSignOut}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register">Register</Link>
              </>
            ))}
        </nav>
      </header>
      <Outlet />
    </>
  )
}
