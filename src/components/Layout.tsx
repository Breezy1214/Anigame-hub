import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { loginState } from '../auth/loginState'
import { signOut } from '../lib/auth'

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
          <Link to="/" className="brand">
            AniGame Hub
          </Link>
          <Link to="/search">Search</Link>
          {!loading &&
            (user ? (
              <>
                <Link to="/profile" className="nav-user">
                  {user.email}
                </Link>
                <button type="button" onClick={handleSignOut}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" state={loginState(location)}>
                  Log in
                </Link>
                <Link to="/register">Register</Link>
              </>
            ))}
        </nav>
      </header>
      <Outlet />
    </>
  )
}
