import { useEffect, useState } from 'react'
import { getMovieExtras, type MovieExtras } from '../lib/tmdb'

/** Fetch trailer/cast/streaming providers for a movie, keyed on id + region. */
export function useMovieExtras(movieId: number | null, region: string): MovieExtras | null {
  const [extras, setExtras] = useState<MovieExtras | null>(null)

  useEffect(() => {
    if (movieId == null) {
      setExtras(null)
      return
    }
    let cancelled = false
    setExtras(null)
    getMovieExtras(movieId, region)
      .then((e) => { if (!cancelled) setExtras(e) })
      .catch(() => { if (!cancelled) setExtras(null) })
    return () => { cancelled = true }
  }, [movieId, region])

  return extras
}
