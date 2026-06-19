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
    <div
      role="tablist"
      className="inline-flex gap-1 rounded-full border border-panel-border bg-bg-elevated/50 p-1"
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition sm:px-4 sm:text-sm ${
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
