import { describe, expect, it } from 'vitest'
import { statusLabel } from './tracking'

describe('statusLabel', () => {
  it('uses watch wording for anime and play wording for games', () => {
    expect(statusLabel('completed', 'anime')).toBe('Watched')
    expect(statusLabel('completed', 'game')).toBe('Played')
    expect(statusLabel('planned', 'game')).toBe('Plan to Play')
  })
})
