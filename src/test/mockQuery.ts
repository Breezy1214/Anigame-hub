/**
 * A stand-in for a Supabase query builder: every method call is recorded and returns the builder,
 * and awaiting it resolves to `result`.
 */
export function mockQuery(result: { data?: unknown; error?: unknown }) {
  const calls: [string, unknown[]][] = []
  const builder: object = new Proxy(
    {},
    {
      get(_, method: string) {
        if (method === 'then') {
          return (resolve: (value: unknown) => unknown) => resolve({ data: null, error: null, ...result })
        }
        return (...args: unknown[]) => {
          calls.push([method, args])
          return builder
        }
      },
    },
  )
  return { builder, calls }
}
