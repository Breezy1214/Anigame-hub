export const MIN_PASSWORD_LENGTH = 8

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
