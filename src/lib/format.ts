/** Formats a possibly partial ISO date ("2023", "2023-09", "2023-09-29"). */
export function formatReleaseDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, (month || 1) - 1, day || 1))
  return date.toLocaleDateString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
    month: month ? 'long' : undefined,
    day: day ? 'numeric' : undefined,
  })
}
