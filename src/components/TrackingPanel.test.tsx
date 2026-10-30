import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { MediaSummary } from '../lib/media'
import { renderWithAuth } from '../test/renderWithAuth'
import TrackingPanel, { type SavedEntry } from './TrackingPanel'

const { saveMedia } = vi.hoisted(() => ({ saveMedia: vi.fn() }))
vi.mock('../lib/userMedia', () => ({ saveMedia }))

const media: MediaSummary = { id: '1', type: 'anime', title: 'Cowboy Bebop', coverUrl: null, releaseYear: 1998 }

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
    saveMedia.mockResolvedValue({ id: 'row-1' })
    renderPanel({ status: 'success', data: null })

    await userEvent.click(screen.getByRole('button', { name: 'Save to my list' }))
    expect(saveMedia).toHaveBeenCalledWith(media)
    expect(await screen.findByText('Saved to your list.')).toBeInTheDocument()
  })

  it('shows titles that are already saved', () => {
    renderPanel({ status: 'success', data: { id: 'row-1' } as never })
    expect(screen.getByText('Saved to your list.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save to my list' })).not.toBeInTheDocument()
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
