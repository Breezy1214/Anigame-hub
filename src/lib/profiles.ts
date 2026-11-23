import { supabase } from './supabase'

/** A row of `public.profiles` (see supabase/migrations). */
export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type ProfileInput = Pick<Profile, 'username' | 'display_name' | 'bio' | 'is_public'>

export type SaveProfileResult = { status: 'saved'; profile: Profile } | { status: 'error'; message: string }

const UNIQUE_VIOLATION = '23505'

async function findProfile(column: 'id' | 'username', value: string, signal: AbortSignal) {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq(column, value)
    .abortSignal(signal)
    .maybeSingle<Profile>()
  if (error) throw error
  return data
}

export function getProfile(userId: string, signal: AbortSignal) {
  return findProfile('id', userId, signal)
}

/** A profile by username; null when it doesn't exist or is private to someone else. */
export function getProfileByUsername(username: string, signal: AbortSignal) {
  return findProfile('username', username, signal)
}

/** Creates or updates the signed-in user's profile. */
export async function saveProfile(input: ProfileInput): Promise<SaveProfileResult> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(input, { onConflict: 'id' })
    .select()
    .single<Profile>()
  if (!error) return { status: 'saved', profile: data }
  if (error.code === UNIQUE_VIOLATION) return { status: 'error', message: 'That username is taken.' }
  console.error(error)
  return { status: 'error', message: 'Couldn’t save your profile. Please try again.' }
}
