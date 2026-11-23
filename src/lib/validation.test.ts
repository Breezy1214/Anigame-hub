import { describe, expect, it } from 'vitest'
import { validateRegistration } from './validation'

describe('validateRegistration', () => {
  it('rejects invalid emails, short passwords, and mismatches', () => {
    expect(validateRegistration('nope', 'password1', 'password1')).toMatch(/valid email/)
    expect(validateRegistration('a@b.co', 'short', 'short')).toMatch(/at least 8/)
    expect(validateRegistration('a@b.co', 'password1', 'password2')).toMatch(/do not match/)
    expect(validateRegistration('a@b.co', 'password1', 'password1')).toBeNull()
  })
})
