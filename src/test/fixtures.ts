import type { AnimeDetails, MediaSummary } from '../lib/media'
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

/** Cowboy Bebop as a search result; override what a test cares about. */
export function mediaSummary(overrides: Partial<MediaSummary> = {}): MediaSummary {
  return {
    id: '1',
    type: 'anime',
    title: 'Cowboy Bebop',
    coverUrl: null,
    coverColor: null,
    releaseYear: 1998,
    score: null,
    category: null,
    ...overrides,
  }
}

/** Cowboy Bebop's details page data; override what a test cares about. */
export function animeDetails(overrides: Partial<AnimeDetails> = {}): AnimeDetails {
  return {
    ...mediaSummary(),
    type: 'anime',
    bannerUrl: null,
    description: null,
    genres: [],
    releaseDate: null,
    episodeCount: 26,
    ...overrides,
  }
}
