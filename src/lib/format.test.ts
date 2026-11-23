import { describe, expect, it } from 'vitest'
import { formatReleaseDate } from './format'

describe('formatReleaseDate', () => {
  it('formats full and partial dates', () => {
    expect(formatReleaseDate('2023-09-29')).toBe(
      new Date(Date.UTC(2023, 8, 29)).toLocaleDateString(undefined, {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    )
    expect(formatReleaseDate('2027')).toBe('2027')
    expect(formatReleaseDate('2027-10')).toMatch(/2027/)
    expect(formatReleaseDate('2027-10')).not.toMatch(/\b1\b/)
  })
})
