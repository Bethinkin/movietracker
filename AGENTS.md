# AGENTS.md

## Cursor Cloud specific instructions

Movie Tracker is a **client-only React 19 + Vite 8 + TypeScript SPA** (no local backend). It talks
directly to two external hosted services at runtime: **TMDB** (movie data) and **Supabase**
(auth, cloud library, profiles, storage). Standard scripts live in `package.json`
(`dev`, `build`, `lint`, `preview`) and setup is documented in `README.md`.

- **Run (dev):** `npm run dev` serves on `http://localhost:5173` (Vite default).
- **Build / preview / lint:** see `package.json` scripts (`npm run build`, `npm run preview`, `npm run lint`).

### Non-obvious caveats

- **The entire UI is gated behind Supabase auth.** `src/App.tsx` returns `<AuthDialog />` until a
  user session exists. Without valid `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, the Supabase
  client falls back to placeholder values (`src/lib/supabase.ts`), so sign-in/sign-up requests fail
  with "Failed to fetch" and you cannot reach the home page. A full end-to-end run therefore requires
  real Supabase credentials (and running the SQL in `supabase/migrations/` in date order on the project).
- **Movie search/add requires a TMDB key.** `VITE_TMDB_API_KEY` powers search, browse, posters, and
  recommendations. Without it the app loads and the "Add a movie" dialog shows a "No TMDB API key found"
  message instead of results.
- **Env vars are `VITE_`-prefixed and read at dev-server start.** Put them in a `.env` file at the repo
  root (gitignored; no `.env.example` is committed) and **restart `npm run dev`** after changing them —
  Vite does not hot-reload `import.meta.env`.
- **`npm run lint` currently reports pre-existing `react-hooks/set-state-in-effect` errors** in a few
  `src/hooks/*` files (exit code 1). These are part of the repo's current state, not an environment issue.
