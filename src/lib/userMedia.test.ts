import { describe, expect, it, vi } from 'vitest'
import { mockQuery } from '../test/mockQuery'
import { findUserMedia, saveMedia } from './userMedia'

const { from } = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { from } }))

const row = { id: 'row-1', user_id: 'user-1', external_media_id: '1', media_type: 'anime', title: 'Cowboy Bebop' }
const signal = new AbortController().signal

describe('findUserMedia', () => {
  it('looks up the signed-in user’s entry for a title', async () => {
    const query = mockQuery({ data: row })
    from.mockReturnValue(query.builder)

    expect(await findUserMedia('user-1', 'anime', '1', signal)).toEqual(row)
    expect(from).toHaveBeenCalledWith('user_media')
    expect(query.calls.filter(([method]) => method === 'eq').map(([, args]) => args)).toEqual([
      ['user_id', 'user-1'],
      ['media_type', 'anime'],
      ['external_media_id', '1'],
    ])
  })

  it('returns null when the title is not saved', async () => {
    from.mockReturnValue(mockQuery({ data: null }).builder)
    expect(await findUserMedia('user-1', 'anime', '1', signal)).toBeNull()
  })

  it('throws database errors', async () => {
    from.mockReturnValue(mockQuery({ error: { message: 'boom' } }).builder)
    await expect(findUserMedia('user-1', 'anime', '1', signal)).rejects.toEqual({ message: 'boom' })
  })
})

describe('saveMedia', () => {
  it('upserts the title and cover from the summary', async () => {
    const query = mockQuery({ data: row })
    from.mockReturnValue(query.builder)

    const saved = await saveMedia({
      id: '1',
      type: 'anime',
      title: 'Cowboy Bebop',
      coverUrl: 'https://img/bebop.jpg',
      releaseYear: 1998,
    })
    expect(saved).toEqual(row)
    expect(query.calls[0]).toEqual([
      'upsert',
      [
        { external_media_id: '1', media_type: 'anime', title: 'Cowboy Bebop', cover_url: 'https://img/bebop.jpg' },
        { onConflict: 'user_id,media_type,external_media_id' },
      ],
    ])
  })
})
