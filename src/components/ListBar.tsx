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
  `rounded-full border px-3 py-1 text-xs transition ${
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
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs uppercase tracking-widest text-text-muted">Lists</span>

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
            className="ml-0.5 grid h-5 w-5 place-items-center rounded-full text-text-muted transition hover:text-red-400"
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
          className="w-32 rounded-full border border-accent bg-bg-elevated/60 px-3 py-1 text-xs text-text outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full border border-panel-border px-3 py-1 text-xs text-text-muted transition hover:border-accent/60 hover:text-text"
        >
          <Plus size={12} /> New list
        </button>
      )}
    </div>
  )
}
