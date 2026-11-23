import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { loginState } from './loginState'

/**
 * Layout route for pages that need a signed-in user. Visitors who arrive signed out go to log in (and back);
 * users whose session ends here (logging out, here or in another tab) go home.
 */
export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [wasSignedIn, setWasSignedIn] = useState(false)
  if (user && !wasSignedIn) setWasSignedIn(true)

  if (loading) return null
  if (!user) {
    return wasSignedIn ? <Navigate to="/" replace /> : <Navigate to="/login" state={loginState(location)} replace />
  }
  return <Outlet />
}
