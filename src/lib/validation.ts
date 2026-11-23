export const MIN_PASSWORD_LENGTH = 8

export function validateLogin(email: string, password: string) {
  return email && password ? null : 'Enter your email and password.'
}

export function validateRegistration(email: string, password: string, confirmPassword: string) {
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Enter a valid email address.'
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.'
  }
  return null
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export function validateUsername(username: string) {
  return USERNAME_PATTERN.test(username)
    ? null
    : 'Usernames are 3–20 characters: lowercase letters, numbers and underscores.'
}
