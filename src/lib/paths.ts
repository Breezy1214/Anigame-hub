import type { MediaType } from './media'

/** The details page for a title (see the /media/:type/:id route). */
export function mediaPath(type: MediaType, id: string) {
  return `/media/${type}/${id}`
}

/** The shareable public profile page for a username (see the /u/:username route). */
export function publicProfilePath(username: string) {
  return `/u/${username}`
}

/** The search page, on the given tab and (when there is one) query. */
export function searchPath(type: MediaType, query = '') {
  return `/search?${new URLSearchParams(query ? { type, q: query } : { type })}`
}
