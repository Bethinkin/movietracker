import { Star } from 'lucide-react'

interface Props {
  value: number // 0–5
  onChange?: (value: number) => void
  size?: number
}

export function StarRating({ value, onChange, size = 20 }: Props) {
  const readOnly = !onChange
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={readOnly ? 'cursor-default' : 'transition hover:scale-110'}
        >
          <Star
            size={size}
            className={star <= value ? 'fill-accent text-accent' : 'text-text-muted/40'}
          />
        </button>
      ))}
    </div>
  )
}
