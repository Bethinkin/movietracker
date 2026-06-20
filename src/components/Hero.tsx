import { PlayCircle, User } from 'lucide-react'
import { backdropUrl } from '../lib/tmdb'
import type { SavedMovie } from '../lib/types'

/** One rotating hero background. `movie` is set only for collection items. */
export interface HeroSlide {
  key: string
  title: string
  backdropPath: string | null
  movie?: SavedMovie
}

interface Props {
  slides: HeroSlide[]
  index: number
  onPrev: () => void
  onNext: () => void
  onAddClick: () => void
  onFeaturedClick: (movie: SavedMovie) => void
  onProfileClick: () => void
  avatarUrl?: string | null
  userName?: string
}

export function Hero({
  slides,
  index,
  onPrev,
  onNext,
  onAddClick,
  onFeaturedClick,
  onProfileClick,
  avatarUrl,
  userName,
}: Props) {
  const current = slides[index]
  const backdrop = current?.backdropPath ? backdropUrl(current.backdropPath, 'original') : null

  return (
    <header className="relative h-[68vh] min-h-[440px] w-full overflow-hidden sm:h-[78vh] sm:min-h-[520px]">
      {/* Backdrop image (decorative — never intercept clicks) */}
      {backdrop ? (
        <img
          key={current.key}
          src={backdrop}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/40 via-bg to-bg" />
      )}

      {/* Gradient scrims: darken left + bottom for legibility (decorative) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-10 sm:py-6">
        <div className="flex items-center gap-2.5 text-text">
          <svg
            viewBox="0 0 25 34"
            className="h-5 w-auto text-green-500"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19,1.2v1.9c-1.8-1.1-3.8-1.8-6-1.8h-0.4h-0.4c-1,0-1.9,0.2-2.8,0.4v6.1c0.9-0.5,2-0.8,3.2-0.8 c3.3,0,6,2.4,6.4,5.6c0,0.3,0.1,0.6,0.1,0.9c0,0.1,0,0.2,0,0.3c-0.2,3.4-3,6.2-6.5,6.2c-3.6,0-6.5-2.9-6.5-6.5V3.2 C5.1,3.8,4.3,4.5,3.5,5.4h0C2.6,6.5,1.9,7.7,1.3,9C1.2,9.3,1.1,9.6,1,9.9c-0.1,0.3-0.2,0.6-0.2,0.9c0,0,0,0.1,0,0.1 c-0.1,0.4-0.1,0.8-0.2,1.1c0,0,0,0,0,0c0,0.4-0.1,0.8-0.1,1.2c0,0,0,0,0,0c0,1.5,0.3,2.9,0.8,4.2c0.1,0.2,0.1,0.3,0.2,0.5 c0.3,0.7,0.7,1.4,1.1,2.1c0.7,1,1.4,1.8,2.3,2.6c0.9,0.7,1.9,1.3,3,1.8c1.5,0.6,3,1,4.7,1c1.1,0,2.1-0.1,3.1-0.4 c1-0.3,1.9-0.6,2.8-1.1c0,0,0,0,0,0c-0.5,0.9-1.2,1.7-2.1,2.2c-0.9,0.6-1.9,0.9-3,0.9v5.7c1.5,0,3-0.3,4.4-0.9 c1.4-0.6,2.6-1.4,3.6-2.4c1-1,1.8-2.2,2.4-3.6c0.6-1.4,0.9-2.8,0.9-4.4v-4.8v-2.5v-1.6v-2.3V5.8V4.7L19,1.2z" />
          </svg>
          <span className="tracking-display text-sm uppercase">
            <span className="font-light">Brand</span>
            <span className="font-bold">Green</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Open profile"
          className="glass flex items-center gap-2 rounded-full p-1 pr-3 text-text transition hover:text-accent"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-bg-elevated">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User size={15} />
            )}
          </span>
          {userName && (
            <span className="max-w-[120px] truncate text-sm sm:max-w-[160px]">{userName}</span>
          )}
        </button>
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
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-4 px-4 pb-6 text-xs text-text-muted sm:gap-6 sm:px-10 sm:pb-8 sm:text-sm">
          <button
            type="button"
            onClick={onPrev}
            className="uppercase tracking-widest transition hover:text-text"
          >
            ◯ Prev
          </button>
          <span className="font-mono text-text">
            {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="uppercase tracking-widest transition hover:text-text"
          >
            Next ◯
          </button>
          {current?.movie && (
            <button
              type="button"
              onClick={() => onFeaturedClick(current.movie!)}
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
