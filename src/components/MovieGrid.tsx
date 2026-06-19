import { MovieCard } from './MovieCard'
import type { SavedMovie } from '../lib/types'

interface Props {
  movies: SavedMovie[]
  onSelect: (movie: SavedMovie) => void
}

export function MovieGrid({ movies, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onClick={() => onSelect(movie)} />
      ))}
    </div>
  )
}
