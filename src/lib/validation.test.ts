import { describe, expect, it } from 'vitest'
import { validateLogin, validateRegistration, validateUsername } from './validation'

describe('validateLogin', () => {
  it('requires both fields', () => {
    expect(validateLogin('', 'password1')).toMatch(/email and password/)
    expect(validateLogin('a@b.co', '')).toMatch(/email and password/)
    expect(validateLogin('a@b.co', 'password1')).toBeNull()
  })
})

describe('validateRegistration', () => {
  it('rejects invalid emails, short passwords, and mismatches', () => {
    expect(validateRegistration('nope', 'password1', 'password1')).toMatch(/valid email/)
    expect(validateRegistration('a@b.co', 'short', 'short')).toMatch(/at least 8/)
    expect(validateRegistration('a@b.co', 'password1', 'password2')).toMatch(/do not match/)
    expect(validateRegistration('a@b.co', 'password1', 'password1')).toBeNull()
  })
})

describe('validateUsername', () => {
  it('accepts 3-20 lowercase letters, digits and underscores', () => {
    expect(validateUsername('spike_99')).toBeNull()
    expect(validateUsername('ab')).toMatch(/3–20/)
    expect(validateUsername('Spike')).toMatch(/lowercase/)
    expect(validateUsername('a'.repeat(21))).toMatch(/3–20/)
  })
})
