# Movie Tracker

A personal tool to track movies you've **seen** and movies you **want to see**, with
real movie data (posters, overviews, ratings) pulled from
[TMDB](https://www.themoviedb.org/). Light + dark mode, cinematic UI.

## Tech stack

- **React + Vite + TypeScript**
- **Tailwind CSS v4** (light/dark via CSS variables)
- **Zustand** + `persist` → your library is saved in the browser's `localStorage`
- **TMDB** for movie search, posters, and backdrops
- **lucide-react** icons

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

### Add your free TMDB API key

Search and posters need a TMDB key (free, no credit card):

1. Create an account at https://www.themoviedb.org and go to
   **Settings → API** to request a key.
2. Copy `.env.example` to `.env` and paste your key:

   ```
   VITE_TMDB_API_KEY=your_key_here
   ```

3. Restart `npm run dev`.

Until a key is added, the app runs fine and the "Add a movie" dialog explains how
to set one up.

> Note: this is a client-only app, so the TMDB key is bundled into the browser.
> That's acceptable for a personal tool. Don't commit `.env` (it's gitignored).

## Accounts & sync (Supabase)

User accounts, the cloud library, profiles, lists, and avatar uploads are backed by
[Supabase](https://supabase.com). Add these to your `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key
```

Run the SQL files in `supabase/migrations/` (in date order) from the Supabase
**SQL editor** to create the tables, row-level-security policies, and the `avatars`
storage bucket.

### Sign in with Google

Email/password works out of the box. To also enable **Continue with Google**, set up
the OAuth provider once in the dashboards (the app code is already in place):

1. **Google Cloud Console** → *APIs & Services → Credentials* → **Create OAuth client ID**
   → application type **Web application**.
   - Add this **Authorized redirect URI** (replace with your project ref):
     `https://your-project.supabase.co/auth/v1/callback`
   - Copy the generated **Client ID** and **Client Secret**.
   - If prompted, configure the **OAuth consent screen** first.
2. **Supabase dashboard** → *Authentication → Providers → **Google*** → enable it, paste
   the **Client ID** + **Client Secret**, and save.
3. **Supabase dashboard** → *Authentication → URL Configuration*:
   - Set **Site URL** to your production domain.
   - Add a **Redirect URL** for every origin you use, e.g. `http://localhost:5173`,
     your preview domain, and your production domain. Each must match the origin the
     app redirects from, or the login is rejected.

New Google users get a profile created automatically, with their name and photo
pre-filled from their Google account (editable later in the profile).

## How it works

- **Add a movie** — search TMDB by title, then add it to *Want to See* or *Seen*.
- **Library** — filter by All / Want to See / Seen; click any poster for details.
- **Details** — switch a movie between *want* and *seen*, give a 1–5 star rating,
  and jot notes (seen movies only). Remove from library anytime.
- **Theme** — toggle light/dark in the top-right; your choice is remembered.

All data lives in `localStorage` under the key `movie-tracker` — no account, no
backend. Clearing browser data clears your library.

## Project structure

```
src/
  App.tsx                 # layout: hero + library
  index.css               # Tailwind + light/dark design tokens
  lib/
    types.ts              # SavedMovie / TmdbMovie types
    tmdb.ts               # TMDB client + image URL helpers
    storage.ts            # zustand store persisted to localStorage
  hooks/useTheme.ts       # light/dark toggle, persisted
  components/             # Hero, SearchDialog, MovieGrid, MovieCard,
                          # MovieDetailDialog, LibraryTabs, ThemeToggle, …
```

## Build

```bash
npm run build     # type-check + production build into dist/
npm run preview   # preview the production build
```
