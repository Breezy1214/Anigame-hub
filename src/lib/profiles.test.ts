import { describe, expect, it, vi } from 'vitest'
import { profileRow } from '../test/fixtures'
import { mockQuery } from '../test/mockQuery'
import { getProfile, getProfileByUsername, saveProfile } from './profiles'

const { from } = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { from } }))

const profile = profileRow()
const input = { username: profile.username, display_name: profile.display_name, bio: profile.bio, is_public: false }

describe('getProfile', () => {
  it('loads a profile by user id', async () => {
    const query = mockQuery({ data: profile })
    from.mockReturnValue(query.builder)
    expect(await getProfile('user-1', new AbortController().signal)).toEqual(profile)
    expect(from).toHaveBeenCalledWith('profiles')
    expect(query.calls).toContainEqual(['eq', ['id', 'user-1']])
  })
})

describe('saveProfile', () => {
  it('upserts the signed-in user’s profile', async () => {
    const query = mockQuery({ data: profile })
    from.mockReturnValue(query.builder)
    expect(await saveProfile(input)).toEqual({ status: 'saved', profile })
    expect(query.calls[0]).toEqual(['upsert', [input, { onConflict: 'id' }]])
  })

  it('reports a taken username', async () => {
    from.mockReturnValue(mockQuery({ error: { code: '23505', message: 'duplicate key' } }).builder)
    expect(await saveProfile(input)).toEqual({ status: 'error', message: 'That username is taken.' })
  })

  it('reports other failures generically', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    from.mockReturnValue(mockQuery({ error: { code: '42501', message: 'denied' } }).builder)
    expect(await saveProfile(input)).toMatchObject({ status: 'error', message: expect.stringContaining('Couldn’t save') })
  })
})

describe('getProfileByUsername', () => {
  it('looks a profile up by username', async () => {
    const query = mockQuery({ data: profile })
    from.mockReturnValue(query.builder)
    expect(await getProfileByUsername('spike', new AbortController().signal)).toEqual(profile)
    expect(query.calls).toContainEqual(['eq', ['username', 'spike']])
  })
})
