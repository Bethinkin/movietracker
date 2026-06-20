import { User } from 'lucide-react'
import { tmdbImage, type MovieExtras } from '../lib/tmdb'

interface Props {
  extras: MovieExtras | null
  region: string
  title: string
  onCastClick?: (name: string) => void
}

/** Trailer + where-to-watch + cast, shared by the saved and preview dialogs. */
export function MovieExtrasSections({ extras, region, title, onCastClick }: Props) {
  if (!extras) return null

  return (
    <>
      {extras.trailerKey && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Trailer</p>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${extras.trailerKey}`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}

      {extras.providers.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">
            Where to watch <span className="font-normal text-text-muted">· {region}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {extras.providers.map((p) => (
              <span
                key={p.providerId}
                className="flex items-center gap-2 rounded-lg border border-panel-border bg-bg-elevated/60 px-2.5 py-1.5 text-xs"
              >
                {p.logoPath && (
                  <img src={tmdbImage(p.logoPath, 'w92')!} alt="" className="h-5 w-5 rounded" />
                )}
                {p.name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-text-muted">
            Streaming availability by JustWatch
            {extras.providerLink && (
              <>
                {' · '}
                <a
                  href={extras.providerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  more options
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {extras.cast.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Cast</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {extras.cast.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onCastClick?.(c.name)}
                className="group w-16 shrink-0 text-center"
                title={`Find movies with ${c.name}`}
              >
                <span className="block h-16 w-16 overflow-hidden rounded-full bg-bg-elevated">
                  {c.profilePath ? (
                    <img
                      src={tmdbImage(c.profilePath, 'w185')!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-text-muted">
                      <User size={20} />
                    </span>
                  )}
                </span>
                <span className="mt-1 block truncate text-[11px] text-text group-hover:text-accent">
                  {c.name}
                </span>
                {c.character && (
                  <span className="block truncate text-[10px] text-text-muted">{c.character}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
