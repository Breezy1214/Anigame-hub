import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { loginState } from './loginState'

/** Layout route for pages that need a signed-in user; sends everyone else to log in (and back). */
export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" state={loginState(location)} replace />
  return <Outlet />
}
