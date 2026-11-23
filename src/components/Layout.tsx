import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { loginState } from '../auth/loginState'
import { signOut } from '../lib/auth'
import QuickSearch from './QuickSearch'

export default function Layout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <header className="site-header">
        <nav aria-label="Main">
          <Link to="/" className="brand" aria-label="AniGame home">
            <span>Ani</span>
            <span>Game</span>
          </Link>
          {/* The header search box replaces this link on wide screens. */}
          <NavLink to="/search" className="nav-search-link">
            Search
          </NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          <div className="header-search">
            <QuickSearch id="header-search" compact />
          </div>
          {!loading &&
            (user ? (
              <div className="account">
                <Link to="/profile" className="nav-user">
                  <span className="avatar" aria-hidden="true">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                  <span className="nav-user-email">{user.email}</span>
                </Link>
                <button type="button" className="link-button" onClick={handleSignOut}>
                  Log out
                </button>
              </div>
            ) : (
              <div className="account">
                <Link to="/login" state={loginState(location)}>
                  Log in
                </Link>
                <Link to="/register" className="primary-button">
                  Register
                </Link>
              </div>
            ))}
        </nav>
      </header>
      <Outlet />
    </>
  )
}
