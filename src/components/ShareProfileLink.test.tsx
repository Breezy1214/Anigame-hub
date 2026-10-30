import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ShareProfileLink from './ShareProfileLink'

const url = `${window.location.origin}/u/spike`

describe('ShareProfileLink', () => {
  it('shows the full profile URL and copies it', async () => {
    const user = userEvent.setup()
    render(<ShareProfileLink username="spike" />)

    expect(screen.getByLabelText('Share your profile')).toHaveValue(url)
    await user.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(await navigator.clipboard.readText()).toBe(url)
    expect(screen.getByRole('status')).toHaveTextContent('Link copied.')
  })

  it('falls back to manual copying when the clipboard is blocked', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    render(<ShareProfileLink username="spike" />)

    await user.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Select the link and copy it')
  })

  it('offers native sharing where the browser supports it', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })
    render(<ShareProfileLink username="spike" />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Share…' }))
    expect(share).toHaveBeenCalledWith({ title: '@spike on AniGame Hub', url })
  })

  it('hides the share button without native sharing', () => {
    render(<ShareProfileLink username="spike" />)
    expect(screen.queryByRole('button', { name: 'Share…' })).not.toBeInTheDocument()
  })
})
