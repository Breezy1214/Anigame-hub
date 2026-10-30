import { describe, expect, it } from 'vitest'
import { clampProgress, progressLimit, statusLabel } from './tracking'

describe('statusLabel', () => {
  it('uses watch wording for anime and play wording for games', () => {
    expect(statusLabel('completed', 'anime')).toBe('Watched')
    expect(statusLabel('completed', 'game')).toBe('Played')
    expect(statusLabel('planned', 'game')).toBe('Plan to Play')
  })
})

describe('progress', () => {
  it('limits anime to its episode count and games to 100%', () => {
    expect(progressLimit({ type: 'anime', episodeCount: 26 } as never)).toBe(26)
    expect(progressLimit({ type: 'anime', episodeCount: null } as never)).toBeNull()
    expect(progressLimit({ type: 'game', platforms: [] } as never)).toBe(100)
  })

  it('clamps typed progress to a whole number in range', () => {
    expect(clampProgress('30', 26)).toBe(26)
    expect(clampProgress('-4', 26)).toBe(0)
    expect(clampProgress('3.7', 26)).toBe(3)
    expect(clampProgress('', 26)).toBe(0)
    expect(clampProgress('1100', null)).toBe(1100)
  })
})
