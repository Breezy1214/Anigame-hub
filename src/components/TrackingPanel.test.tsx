import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { MediaSummary } from '../lib/media'
import type { UserMedia } from '../lib/userMedia'
import { renderWithAuth } from '../test/renderWithAuth'
import TrackingPanel, { type SavedEntry } from './TrackingPanel'

const { saveMedia, updateUserMedia } = vi.hoisted(() => ({ saveMedia: vi.fn(), updateUserMedia: vi.fn() }))
vi.mock('../lib/userMedia', () => ({ saveMedia, updateUserMedia }))

const media: MediaSummary = { id: '1', type: 'anime', title: 'Cowboy Bebop', coverUrl: null, releaseYear: 1998 }

const entry = { id: 'row-1', media_type: 'anime', status: 'planned' } as UserMedia

function renderPanel(saved: SavedEntry) {
  renderWithAuth(null, '/media/anime/1', [
    <Route key="details" path="/media/anime/1" element={<TrackingPanel media={media} saved={saved} />} />,
    <Route key="login" path="/login" element={<p>login page</p>} />,
  ])
}

describe('TrackingPanel', () => {
  it('asks signed-out visitors to log in', async () => {
    renderPanel({ status: 'signed-out' })
    await userEvent.click(screen.getByRole('link', { name: 'Log in' }))
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('saves an unsaved title', async () => {
    saveMedia.mockResolvedValue(entry)
    renderPanel({ status: 'success', data: null })

    await userEvent.click(screen.getByRole('button', { name: 'Save to my list' }))
    expect(saveMedia).toHaveBeenCalledWith(media)
    expect(await screen.findByLabelText('Status')).toHaveValue('planned')
  })

  it('labels statuses for the media type', () => {
    renderPanel({ status: 'success', data: entry })
    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual(['Watched', 'In Progress', 'Plan to Watch', 'Dropped'])
    expect(screen.queryByRole('button', { name: 'Save to my list' })).not.toBeInTheDocument()
  })

  it('updates the status', async () => {
    updateUserMedia.mockResolvedValue({ ...entry, status: 'in_progress' })
    renderPanel({ status: 'success', data: entry })

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'in_progress')
    expect(updateUserMedia).toHaveBeenCalledWith('row-1', { status: 'in_progress' })
    expect(await screen.findByLabelText('Status')).toHaveValue('in_progress')
  })

  it('shows the new status before the save finishes', async () => {
    let finishSave!: (entry: UserMedia) => void
    updateUserMedia.mockReturnValue(new Promise((resolve) => (finishSave = resolve)))
    renderPanel({ status: 'success', data: entry })

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'completed')
    expect(screen.getByLabelText('Status')).toHaveValue('completed')
    expect(screen.getByLabelText('Status')).toBeDisabled()

    // Settle the save so the pending transition doesn't leak into later tests.
    finishSave({ ...entry, status: 'completed' })
    await waitFor(() => expect(screen.getByLabelText('Status')).toBeEnabled())
  })

  it('keeps the old status when an update fails', async () => {
    updateUserMedia.mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderPanel({ status: 'success', data: entry })

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'dropped')
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t update your list')
    await waitFor(() => expect(screen.getByLabelText('Status')).toHaveValue('planned'))
  })

  it('shows nothing while the entry loads', () => {
    renderPanel({ status: 'loading' })
    expect(screen.getByRole('region', { name: 'My list' })).toBeEmptyDOMElement()
  })

  it('reports save failures', async () => {
    saveMedia.mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderPanel({ status: 'success', data: null })

    await userEvent.click(screen.getByRole('button', { name: 'Save to my list' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t save this title')
  })
})
