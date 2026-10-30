import { supabase } from './supabase'

/** A row of `public.profiles` (see supabase/migrations). */
export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export type ProfileInput = Pick<Profile, 'username' | 'display_name' | 'bio'>

export type SaveProfileResult = { status: 'saved'; profile: Profile } | { status: 'error'; message: string }

const UNIQUE_VIOLATION = '23505'

export async function getProfile(userId: string, signal: AbortSignal) {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .abortSignal(signal)
    .maybeSingle<Profile>()
  if (error) throw error
  return data
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
