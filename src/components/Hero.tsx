import { Film, LogOut, PlayCircle } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { backdropUrl } from '../lib/tmdb'
import type { Theme } from '../hooks/useTheme'
import type { SavedMovie } from '../lib/types'

interface Props {
  featured: SavedMovie[]
  index: number
  onPrev: () => void
  onNext: () => void
  onAddClick: () => void
  onFeaturedClick: (movie: SavedMovie) => void
  theme: Theme
  onToggleTheme: () => void
  onSignOut: () => void
}

export function Hero({
  featured,
  index,
  onPrev,
  onNext,
  onAddClick,
  onFeaturedClick,
  theme,
  onToggleTheme,
  onSignOut,
}: Props) {
  const current = featured[index]
  const backdrop = current ? backdropUrl(current.backdropPath, 'original') : null

  return (
    <header className="relative h-[68vh] min-h-[440px] w-full overflow-hidden sm:h-[78vh] sm:min-h-[520px]">
      {/* Backdrop image (decorative — never intercept clicks) */}
      {backdrop ? (
        <img
          key={current.id}
          src={backdrop}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/40 via-bg to-bg" />
      )}

      {/* Gradient scrims: darken left + bottom for legibility (decorative) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-10 sm:py-6">
        <div className="flex items-center gap-2 text-text">
          <Film size={20} className="text-accent" />
          <span className="tracking-display text-sm font-semibold uppercase">Movie</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="glass grid h-10 w-10 place-items-center rounded-full text-text transition hover:text-accent"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Center content — wrapper ignores pointer events so its full-height
          box can't cover the top bar; interactive children re-enable them. */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-center px-4 sm:px-10 lg:px-16">
        <p className="mb-2 text-xs uppercase tracking-display text-text-muted sm:mb-3 sm:text-sm">
          Your personal collection
        </p>
        <h1 className="text-4xl font-extralight leading-none tracking-wide sm:text-6xl lg:text-7xl">
          MOVIE <span className="font-bold text-accent">TRACKER</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-text-muted sm:mt-4 sm:text-base">
          {current
            ? current.title
            : 'Track what you’ve seen and what’s next. Search a title to get started.'}
        </p>

        <div className="pointer-events-auto mt-6 w-fit sm:mt-8">
          <button
            type="button"
            onClick={onAddClick}
            className="group flex items-center gap-3 text-text transition hover:text-accent"
          >
            <PlayCircle
              size={40}
              strokeWidth={1}
              className="shrink-0 transition group-hover:scale-105 sm:size-11"
            />
            <span className="text-sm uppercase tracking-widest">Add a movie</span>
          </button>
        </div>
      </div>

      {/* Bottom: prev / counter / next for featured movies */}
      {featured.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-4 px-4 pb-6 text-xs text-text-muted sm:gap-6 sm:px-10 sm:pb-8 sm:text-sm">
          <button
            type="button"
            onClick={onPrev}
            className="uppercase tracking-widest transition hover:text-text"
          >
            ◯ Prev
          </button>
          <span className="font-mono text-text">
            {String(index + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="uppercase tracking-widest transition hover:text-text"
          >
            Next ◯
          </button>
          {current && (
            <button
              type="button"
              onClick={() => onFeaturedClick(current)}
              className="ml-2 hidden rounded-full border border-panel-border px-3 py-1 transition hover:border-accent hover:text-accent sm:block"
            >
              Details
            </button>
          )}
        </div>
      )}
    </header>
  )
}
