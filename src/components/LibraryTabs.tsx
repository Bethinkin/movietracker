import type { Status } from '../lib/types'

export type Filter = 'all' | Status

interface Props {
  active: Filter
  onChange: (filter: Filter) => void
  counts: Record<Filter, number>
}

const TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'want', label: 'Want to See' },
  { key: 'seen', label: 'Seen' },
]

export function LibraryTabs({ active, onChange, counts }: Props) {
  return (
    <div className="inline-flex gap-1 rounded-full border border-panel-border bg-bg-elevated/50 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            active === tab.key
              ? 'bg-accent text-accent-fg'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {tab.label}
          <span className="ml-1.5 opacity-70">{counts[tab.key]}</span>
        </button>
      ))}
    </div>
  )
}
