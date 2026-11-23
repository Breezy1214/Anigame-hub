export type MediaType = 'anime' | 'game'

export type MediaSummary = {
  id: string
  type: MediaType
  title: string
  coverUrl: string | null
  releaseYear: number | null
}
