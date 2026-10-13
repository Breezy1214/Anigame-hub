# Anigame-hub
 A web app for tracking anime and video games, including ratings, progress, favorites, recommendations, and shareable user profiles.

## Tech Stack

Locked from [Requirements.md](Requirements.md):

| Layer | Choice | Requirement |
| --- | --- | --- |
| UI | React + TypeScript | NFR-7 |
| Build / dev server | Vite | — |
| Routing | React Router | FR-15 (shareable profile URLs) |
| Auth | Supabase Authentication (email + password) | FR-1, FR-2, NFR-4 |
| Database | Supabase PostgreSQL (user activity only, no catalogs) | NFR-8, NFR-9 |
| Anime data | External API: AniList or Jikan | FR-4 |
| Game data | External API: RAWG or IGDB | FR-5 |
| Testing | Vitest + React Testing Library | — |

## Getting Started

1. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.
2. `npm install`
3. `npm run dev`

Other scripts: `npm test`, `npm run lint`, `npm run build`.
