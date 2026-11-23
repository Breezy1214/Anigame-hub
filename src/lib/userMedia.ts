import type { MediaSummary, MediaType } from './media'
import { supabase } from './supabase'

export type TrackingStatus = 'planned' | 'in_progress' | 'completed' | 'dropped'

/** A row of `public.user_media` (see supabase/migrations). */
export type UserMedia = {
  id: string
  user_id: string
  external_media_id: string
  media_type: MediaType
  title: string
  cover_url: string | null
  status: TrackingStatus
  rating: number | null
  progress: number
  favorite: boolean
  created_at: string
  updated_at: string
}

/** The user's saved entry for one title, or null if they haven't saved it. */
export async function findUserMedia(userId: string, type: MediaType, externalId: string, signal: AbortSignal) {
  const { data, error } = await supabase
    .from('user_media')
    .select()
    .eq('user_id', userId)
    .eq('media_type', type)
    .eq('external_media_id', externalId)
    .abortSignal(signal)
    .maybeSingle<UserMedia>()
  if (error) throw error
  return data
}

/**
 * Saves a title to the signed-in user's list. Saving an already-saved title only refreshes its
 * title and cover, so status, rating, progress and favorite are kept.
 */
export async function saveMedia(media: MediaSummary) {
  const { data, error } = await supabase
    .from('user_media')
    .upsert(
      { external_media_id: media.id, media_type: media.type, title: media.title, cover_url: media.coverUrl },
      { onConflict: 'user_id,media_type,external_media_id' },
    )
    .select()
    .single<UserMedia>()
  if (error) throw error
  return data
}
