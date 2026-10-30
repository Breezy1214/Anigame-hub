import type { Profile } from '../lib/profiles'
import type { UserMedia } from '../lib/userMedia'

/** A saved anime with default tracking fields; override what a test cares about. */
export function userMediaEntry(overrides: Partial<UserMedia>): UserMedia {
  return {
    id: 'row',
    user_id: 'user-1',
    external_media_id: '1',
    media_type: 'anime',
    title: 'Cowboy Bebop',
    cover_url: null,
    status: 'planned',
    rating: null,
    progress: 0,
    favorite: false,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

/** A private profile for user-1; override what a test cares about. */
export function profileRow(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    username: 'spike',
    display_name: 'Spike Spiegel',
    bio: null,
    is_public: false,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}
