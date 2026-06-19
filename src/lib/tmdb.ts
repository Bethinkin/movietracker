import type { TmdbMovie } from './types'

const API_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined

export function hasApiKey(): boolean {
  return Boolean(API_KEY)
}

/** Map TMDB's genre ids (from search results) to names without an extra request. */
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
}

export function genreNames(movie: TmdbMovie): string[] {
  if (movie.genres?.length) return movie.genres.map((g) => g.name)
  if (movie.genre_ids?.length)
    return movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean)
  return []
}

export function posterUrl(path: string | null, size: 'w342' | 'w500' = 'w500'): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null
}

export function yearOf(releaseDate: string | undefined): string {
  return releaseDate ? releaseDate.slice(0, 4) : ''
}

async function request<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!API_KEY) {
    throw new Error('Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env file.')
  }
  const url = new URL(`${API_BASE}${path}`)
  url.searchParams.set('api_key', API_KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const q = query.trim()
  if (!q) return []
  const data = await request<{ results: TmdbMovie[] }>('/search/movie', {
    query: q,
    include_adult: 'false',
    language: 'en-US',
  })
  return data.results
}

/** Curated browse categories backed by TMDB list endpoints. */
export type BrowseCategory = 'popular' | 'upcoming' | 'top_rated' | 'now_playing'

const BROWSE_PATHS: Record<BrowseCategory, string> = {
  popular: '/movie/popular',
  upcoming: '/movie/upcoming',
  top_rated: '/movie/top_rated',
  now_playing: '/movie/now_playing',
}

export async function browseMovies(category: BrowseCategory): Promise<TmdbMovie[]> {
  const data = await request<{ results: TmdbMovie[] }>(BROWSE_PATHS[category], {
    language: 'en-US',
    region: 'US',
    page: '1',
  })
  return data.results
}

export async function getMovieDetails(id: number): Promise<TmdbMovie> {
  return request<TmdbMovie>(`/movie/${id}`, { language: 'en-US' })
}
