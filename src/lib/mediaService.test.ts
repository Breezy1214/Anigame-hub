import { describe, expect, it, vi } from 'vitest'
import { getMediaDetails, searchMedia } from './mediaService'

const { searchAnime, getGameDetails } = vi.hoisted(() => ({ searchAnime: vi.fn(), getGameDetails: vi.fn() }))
vi.mock('./animeApi', () => ({ searchAnime, getAnimeDetails: vi.fn() }))
vi.mock('./gameApi', () => ({ searchGames: vi.fn(), getGameDetails }))

describe('mediaService', () => {
  it('routes by media type and caches successful responses', async () => {
    searchAnime.mockResolvedValue([{ id: '1' }])
    expect(await searchMedia('anime', 'Frieren')).toEqual([{ id: '1' }])
    expect(await searchMedia('anime', 'frieren')).toEqual([{ id: '1' }])
    expect(searchAnime).toHaveBeenCalledTimes(1)

    getGameDetails.mockResolvedValue({ id: '9', type: 'game' })
    expect(await getMediaDetails('game', '9')).toEqual({ id: '9', type: 'game' })
    expect(getGameDetails).toHaveBeenCalledWith('9', undefined)
  })

  it('does not cache failures', async () => {
    searchAnime.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce([])
    await expect(searchMedia('anime', 'retry')).rejects.toThrow('down')
    expect(await searchMedia('anime', 'retry')).toEqual([])
  })
})
