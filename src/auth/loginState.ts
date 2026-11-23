import type { Location } from 'react-router-dom'

/** Router state for links to /login, so the user comes back to the page they were on. */
export type LoginState = { from: string }

const AUTH_PAGES = ['/login', '/register']

export function loginState(location: Location): LoginState {
  return { from: AUTH_PAGES.includes(location.pathname) ? '/' : location.pathname + location.search }
}

export function returnPath(state: unknown) {
  return (state as Partial<LoginState> | null)?.from ?? '/'
}
