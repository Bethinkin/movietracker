export interface Movie {
  title: string;
  watched: boolean;
}

/**
 * A minimal in-memory movie tracker.
 */
export class MovieTracker {
  private readonly movies = new Map<string, Movie>();

  /** Add a movie to the tracker. Returns false if it already exists. */
  add(title: string): boolean {
    if (this.movies.has(title)) {
      return false;
    }
    this.movies.set(title, { title, watched: false });
    return true;
  }

  /** List all tracked movies. */
  list(): Movie[] {
    return [...this.movies.values()];
  }

  /** Mark a tracked movie as watched. Returns false if it is unknown. */
  markWatched(title: string): boolean {
    const movie = this.movies.get(title);
    if (!movie) {
      return false;
    }
    movie.watched = true;
    return true;
  }
}
