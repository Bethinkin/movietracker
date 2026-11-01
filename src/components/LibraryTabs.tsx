import type { Status } from '../lib/types'

export type Filter = 'all' | Status | 'rewatch'

interface Props {
  active: Filter
  onChange: (filter: Filter) => void
  counts: Record<Filter, number>
}

const TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'want', label: 'Want' },
  { key: 'seen', label: 'Seen' },
  { key: 'rewatch', label: 'Rewatch' },
]

export function LibraryTabs({ active, onChange, counts }: Props) {
  return (
    <div
      role="tablist"
      className="flex w-full gap-1 rounded-full border border-panel-border bg-bg-elevated/50 p-1 sm:inline-flex sm:w-auto"
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-center text-sm transition sm:flex-none sm:px-4 sm:py-1.5 ${
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
