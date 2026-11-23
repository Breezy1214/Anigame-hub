import { useEffect, useEffectEvent, useState } from 'react'

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: T }

/** Narrows a loaded value (e.g. one shelf out of a page's data), passing other states through. */
export function mapAsync<T, U>(state: AsyncState<T>, pick: (data: T) => U): AsyncState<U> {
  return state.status === 'success' ? { status: 'success', data: pick(state.data) } : state
}

/**
 * Runs `load` whenever `key` changes and aborts the previous run; a null `load` means "nothing to load".
 * `key` must encode every input `load` depends on.
 */
export function useAsync<T>(key: string, load: ((signal: AbortSignal) => Promise<T>) | null): AsyncState<T> {
  const [settled, setSettled] = useState<{ key: string; state: AsyncState<T> } | null>(null)
  const enabled = load !== null
  const run = useEffectEvent((signal: AbortSignal) => load?.(signal))

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    run(controller.signal)
      ?.then((data) => setSettled({ key, state: { status: 'success', data } }))
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error(error)
        setSettled({ key, state: { status: 'error' } })
      })
    return () => controller.abort()
  }, [key, enabled])

  if (!enabled) return { status: 'idle' }
  return settled?.key === key ? settled.state : { status: 'loading' }
}
