import { create } from 'zustand'
import { supabase } from './supabase'
import type { SavedMovie, Status, TmdbMovie } from './types'
import { genreNames, yearOf, getMovieDetails } from './tmdb'
import { SEED_MOVIES } from './seed'

interface MovieState {
  movies: SavedMovie[]
  loading: boolean
  loadMovies: () => Promise<void>
  clearMovies: () => void
  addMovie: (movie: TmdbMovie, status: Status) => Promise<void>
  setStatus: (id: number, status: Status) => Promise<void>
  setRating: (id: number, rating: number) => Promise<void>
  setNotes: (id: number, notes: string) => Promise<void>
  setPinned: (id: number, pinned: boolean) => Promise<void>
  setRuntime: (id: number, runtime: number) => Promise<void>
  removeMovie: (id: number) => Promise<void>
  has: (id: number) => boolean
}

// DB row → SavedMovie
function toSaved(row: Record<string, unknown>): SavedMovie {
  return {
    id: row.tmdb_id as number,
    title: row.title as string,
    posterPath: (row.poster_path as string | null) ?? null,
    backdropPath: (row.backdrop_path as string | null) ?? null,
    releaseYear: row.release_year as string,
    overview: row.overview as string,
    tmdbRating: Number(row.tmdb_rating),
    genres: row.genres as string[],
    status: row.status as Status,
    pinned: (row.pinned as boolean | null) ?? false,
    runtime: row.runtime != null ? Number(row.runtime) : undefined,
    userRating: row.user_rating != null ? Number(row.user_rating) : undefined,
    notes: (row.notes as string | null) ?? undefined,
    addedAt: row.added_at as string,
    watchedAt: (row.watched_at as string | null) ?? undefined,
  }
}

// TmdbMovie + status → DB insert row
function toRow(movie: TmdbMovie, status: Status, userId: string) {
  const now = new Date().toISOString()
  return {
    user_id: userId,
    tmdb_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_year: yearOf(movie.release_date),
    overview: movie.overview,
    tmdb_rating: movie.vote_average,
    genres: genreNames(movie),
    status,
    added_at: now,
    watched_at: status === 'seen' ? now : null,
  }
}

// SavedMovie → DB insert row (used for seeding)
function seedToRow(m: SavedMovie, userId: string) {
  return {
    user_id: userId,
    tmdb_id: m.id,
    title: m.title,
    poster_path: m.posterPath,
    backdrop_path: m.backdropPath,
    release_year: m.releaseYear,
    overview: m.overview,
    tmdb_rating: m.tmdbRating,
    genres: m.genres,
    status: m.status,
    user_rating: m.userRating ?? null,
    notes: m.notes ?? null,
    added_at: m.addedAt,
    watched_at: m.watchedAt ?? null,
  }
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export const useMovieStore = create<MovieState>()((set, get) => ({
  movies: [],
  loading: false,

  loadMovies: async () => {
    const userId = await currentUserId()
    if (!userId) { set({ movies: [], loading: false }); return }

    set({ loading: true })
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('[movies] load failed:', error.message, error)
      set({ loading: false })
      return
    }

    const movies = (data ?? []).map(toSaved)

    // Seed the library for brand-new users
    if (movies.length === 0) {
      const seedRows = SEED_MOVIES.map((m) => seedToRow(m, userId))
      const { error: seedError } = await supabase.from('movies').insert(seedRows)
      if (seedError) console.error('[movies] seed failed:', seedError.message, seedError)
      set({ movies: SEED_MOVIES, loading: false })
      return
    }

    set({ movies, loading: false })
  },

  clearMovies: () => set({ movies: [] }),

  addMovie: async (movie, status) => {
    if (get().movies.some((m) => m.id === movie.id)) return
    const userId = await currentUserId()
    if (!userId) return

    const now = new Date().toISOString()
    const optimistic: SavedMovie = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseYear: yearOf(movie.release_date),
      overview: movie.overview,
      tmdbRating: movie.vote_average,
      genres: genreNames(movie),
      status,
      pinned: false,
      addedAt: now,
      watchedAt: status === 'seen' ? now : undefined,
    }
    set((s) => ({ movies: [optimistic, ...s.movies] }))
    const { error } = await supabase.from('movies').insert(toRow(movie, status, userId))
    if (error) {
      console.error('[movies] insert failed:', error.message, error)
      // Roll back the optimistic add so the UI matches the database.
      set((s) => ({ movies: s.movies.filter((m) => m.id !== movie.id) }))
      return
    }
    // Backfill runtime (not present in search/browse results) for stats.
    if (movie.runtime == null) {
      getMovieDetails(movie.id)
        .then((d) => { if (d.runtime) get().setRuntime(movie.id, d.runtime) })
        .catch(() => {})
    } else {
      get().setRuntime(movie.id, movie.runtime)
    }
  },

  setStatus: async (id, status) => {
    set((s) => ({
      movies: s.movies.map((m) =>
        m.id === id
          ? { ...m, status, watchedAt: status === 'seen' ? (m.watchedAt ?? new Date().toISOString()) : undefined }
          : m,
      ),
    }))
    const userId = await currentUserId()
    if (!userId) return
    await supabase
      .from('movies')
      .update({ status, watched_at: status === 'seen' ? new Date().toISOString() : null })
      .match({ user_id: userId, tmdb_id: id })
  },

  setRating: async (id, rating) => {
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? { ...m, userRating: rating } : m)),
    }))
    const userId = await currentUserId()
    if (!userId) return
    await supabase
      .from('movies')
      .update({ user_rating: rating })
      .match({ user_id: userId, tmdb_id: id })
  },

  setNotes: async (id, notes) => {
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? { ...m, notes } : m)),
    }))
    const userId = await currentUserId()
    if (!userId) return
    await supabase
      .from('movies')
      .update({ notes })
      .match({ user_id: userId, tmdb_id: id })
  },

  setPinned: async (id, pinned) => {
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? { ...m, pinned } : m)),
    }))
    const userId = await currentUserId()
    if (!userId) return
    await supabase
      .from('movies')
      .update({ pinned })
      .match({ user_id: userId, tmdb_id: id })
  },

  setRuntime: async (id, runtime) => {
    if (!runtime) return
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? { ...m, runtime } : m)),
    }))
    const userId = await currentUserId()
    if (!userId) return
    await supabase
      .from('movies')
      .update({ runtime })
      .match({ user_id: userId, tmdb_id: id })
  },

  removeMovie: async (id) => {
    set((s) => ({ movies: s.movies.filter((m) => m.id !== id) }))
    const userId = await currentUserId()
    if (!userId) return
    await supabase.from('movies').delete().match({ user_id: userId, tmdb_id: id })
  },

  has: (id) => get().movies.some((m) => m.id === id),
}))
