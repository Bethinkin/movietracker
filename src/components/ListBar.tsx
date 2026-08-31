import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { MovieList } from '../lib/lists'

interface Props {
  lists: MovieList[]
  selectedListId: string | null
  onSelect: (id: string | null) => void
  onCreate: (name: string) => void
  onDelete: (id: string) => void
}

const chip = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-3.5 py-2 text-sm transition sm:px-3 sm:py-1 sm:text-xs ${
    active
      ? 'border-accent bg-accent/15 text-accent'
      : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
  }`

export function ListBar({ lists, selectedListId, onSelect, onCreate, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const submit = () => {
    if (name.trim()) onCreate(name.trim())
    setName('')
    setAdding(false)
  }

  return (
    <div className="flex w-max items-center gap-1.5">
      <span className="mr-1 text-sm uppercase tracking-widest text-text-muted sm:text-xs">Lists</span>

      <button type="button" onClick={() => onSelect(null)} className={chip(selectedListId === null)}>
        All
      </button>

      {lists.map((l) => (
        <span key={l.id} className="inline-flex items-center">
          <button type="button" onClick={() => onSelect(l.id)} className={chip(selectedListId === l.id)}>
            {l.name} <span className="opacity-60">{l.movieIds.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete the list “${l.name}”?`)) {
                if (selectedListId === l.id) onSelect(null)
                onDelete(l.id)
              }
            }}
            aria-label={`Delete list ${l.name}`}
            className="ml-0.5 grid h-7 w-7 place-items-center rounded-full text-text-muted transition hover:text-red-400 sm:h-5 sm:w-5"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={submit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') { setName(''); setAdding(false) }
          }}
          placeholder="List name…"
          aria-label="New list name"
          className="w-36 rounded-full border border-accent bg-bg-elevated/60 px-3.5 py-2 text-sm text-text outline-none sm:w-32 sm:px-3 sm:py-1 sm:text-xs"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 whitespace-nowrap rounded-full border border-panel-border px-3.5 py-2 text-sm text-text-muted transition hover:border-accent/60 hover:text-text sm:px-3 sm:py-1 sm:text-xs"
        >
          <Plus size={12} /> New list
        </button>
      )}
    </div>
  )
}
