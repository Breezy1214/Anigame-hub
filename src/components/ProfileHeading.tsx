import type { ReactNode } from 'react'
import type { Profile } from '../lib/profiles'

/** A profile's name and @username; `children` adds page-specific details below them. */
export default function ProfileHeading({ profile, children }: { profile: Profile; children?: ReactNode }) {
  return (
    <>
      <h1>{profile.display_name ?? profile.username}</h1>
      <p>@{profile.username}</p>
      {children}
    </>
  )
}
