import { MovieCard } from './MovieCard'
import { MovieCardSkeleton } from './MovieCardSkeleton'
import { useInView } from '../hooks/useInView'
import type { SavedMovie } from '../lib/types'

interface Props {
  movies: SavedMovie[]
  onSelect: (movie: SavedMovie) => void
}

export function MovieGrid({ movies, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <LazyTile key={movie.id} movie={movie} onSelect={onSelect} />
      ))}
    </div>
  )
}

/** Renders a skeleton until the cell scrolls near the viewport, then the card. */
function LazyTile({ movie, onSelect }: { movie: SavedMovie; onSelect: (m: SavedMovie) => void }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref}>
      {inView ? (
        <MovieCard movie={movie} onClick={() => onSelect(movie)} />
      ) : (
        <MovieCardSkeleton />
      )}
    </div>
  )
}
