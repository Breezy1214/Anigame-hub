import { vi } from 'vitest'

export function mockFetch(status: number, body: unknown) {
  // A Response body can only be read once, so build a fresh one per call.
  const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
