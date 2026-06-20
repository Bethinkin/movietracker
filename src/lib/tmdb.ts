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

/** Generic TMDB image URL (profiles, logos, etc.). */
export function tmdbImage(path: string | null, size: string): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null
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

interface PersonResult {
  id: number
  name: string
  popularity: number
}

/**
 * Search by movie title AND by actor/actress (and other credited people).
 * TMDB's search is typo-tolerant, so this behaves as a fuzzy search. Title
 * matches come first; the best-matching person's filmography is merged in
 * below, de-duplicated and ranked by popularity.
 */
export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const q = query.trim()
  if (!q) return []

  const [movieData, personData] = await Promise.all([
    request<{ results: TmdbMovie[] }>('/search/movie', {
      query: q,
      include_adult: 'false',
      language: 'en-US',
    }),
    request<{ results: PersonResult[] }>('/search/person', {
      query: q,
      include_adult: 'false',
      language: 'en-US',
    }),
  ])

  // Title matches first, keyed by id to de-duplicate.
  const byId = new Map<number, TmdbMovie>()
  for (const m of movieData.results) if (m.title) byId.set(m.id, m)

  // Merge in the filmography of the best-matching person (actor/actress/crew).
  const topPerson = personData.results[0]
  if (topPerson) {
    try {
      const credits = await request<{ cast?: TmdbMovie[] }>(
        `/person/${topPerson.id}/movie_credits`,
        { language: 'en-US' },
      )
      const personMovies = (credits.cast ?? [])
        .filter((m) => m.title)
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 20)
      for (const m of personMovies) if (!byId.has(m.id)) byId.set(m.id, m)
    } catch {
      // Ignore credit-fetch failures; title results are still returned.
    }
  }

  return [...byId.values()]
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

/** TMDB's all-time top-rated, first 100 (5 pages of 20), in ranked order. */
export async function getTop100(): Promise<TmdbMovie[]> {
  const pages = await Promise.all(
    [1, 2, 3, 4, 5].map((page) =>
      request<{ results: TmdbMovie[] }>('/movie/top_rated', {
        language: 'en-US',
        page: String(page),
      }),
    ),
  )
  return pages.flatMap((p) => p.results).slice(0, 100)
}

export async function getMovieDetails(id: number): Promise<TmdbMovie> {
  return request<TmdbMovie>(`/movie/${id}`, { language: 'en-US' })
}

// ---------------------------------------------------------------------------
// Detail enrichment: trailer, cast, and streaming providers
// ---------------------------------------------------------------------------

export interface CastMember {
  id: number
  name: string
  character: string
  profilePath: string | null
}

export interface WatchProvider {
  providerId: number
  name: string
  logoPath: string | null
}

export interface MovieExtras {
  trailerKey: string | null
  cast: CastMember[]
  providers: WatchProvider[]
  providerLink: string | null
}

interface RawExtras {
  videos?: { results?: { key: string; site: string; type: string }[] }
  credits?: { cast?: { id: number; name: string; character: string; profile_path: string | null }[] }
  'watch/providers'?: {
    results?: Record<
      string,
      { link?: string; flatrate?: { provider_id: number; provider_name: string; logo_path: string | null }[] }
    >
  }
}

/** Trailer + top cast + streaming providers for the given region. */
export async function getMovieExtras(id: number, region = 'US'): Promise<MovieExtras> {
  const data = await request<RawExtras>(`/movie/${id}`, {
    language: 'en-US',
    append_to_response: 'videos,credits,watch/providers',
  })

  const vids = data.videos?.results ?? []
  const trailer =
    vids.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
    vids.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ??
    vids.find((v) => v.site === 'YouTube')

  const cast = (data.credits?.cast ?? []).slice(0, 12).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profilePath: c.profile_path ?? null,
  }))

  const wp = data['watch/providers']?.results?.[region]
  const providers = (wp?.flatrate ?? []).map((p) => ({
    providerId: p.provider_id,
    name: p.provider_name,
    logoPath: p.logo_path ?? null,
  }))

  return {
    trailerKey: trailer?.key ?? null,
    cast,
    providers,
    providerLink: wp?.link ?? null,
  }
}

/** Movies TMDB recommends based on the given movie. */
export async function getRecommendations(id: number): Promise<TmdbMovie[]> {
  const data = await request<{ results: TmdbMovie[] }>(`/movie/${id}/recommendations`, {
    language: 'en-US',
  })
  return data.results
}
