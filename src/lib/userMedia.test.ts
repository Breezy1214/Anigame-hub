import { describe, expect, it, vi } from 'vitest'
import { mockQuery } from '../test/mockQuery'
import { deleteUserMedia, findUserMedia, listUserMedia, saveMedia, updateUserMedia } from './userMedia'

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

describe('updateUserMedia', () => {
  it('updates one row by id and returns it', async () => {
    const query = mockQuery({ data: { ...row, status: 'completed' } })
    from.mockReturnValue(query.builder)

    expect(await updateUserMedia('row-1', { status: 'completed' })).toMatchObject({ status: 'completed' })
    expect(query.calls.slice(0, 2)).toEqual([
      ['update', [{ status: 'completed' }]],
      ['eq', ['id', 'row-1']],
    ])
  })
})

describe('deleteUserMedia', () => {
  it('deletes one row by id', async () => {
    const query = mockQuery({})
    from.mockReturnValue(query.builder)
    await deleteUserMedia('row-1')
    expect(query.calls).toEqual([
      ['delete', []],
      ['eq', ['id', 'row-1']],
    ])
  })

  it('throws database errors', async () => {
    from.mockReturnValue(mockQuery({ error: { message: 'denied' } }).builder)
    await expect(deleteUserMedia('row-1')).rejects.toEqual({ message: 'denied' })
  })
})

describe('listUserMedia', () => {
  it('lists the user’s titles, most recently updated first', async () => {
    const query = mockQuery({ data: [row] })
    from.mockReturnValue(query.builder)
    expect(await listUserMedia('user-1', signal)).toEqual([row])
    expect(query.calls).toContainEqual(['eq', ['user_id', 'user-1']])
    expect(query.calls).toContainEqual(['order', ['updated_at', { ascending: false }]])
  })
})
