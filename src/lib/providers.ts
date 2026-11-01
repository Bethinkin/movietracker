import { create } from 'zustand'
import { getWatchProviderIds } from './tmdb'

interface ProvidersState {
  byId: Record<number, number[]> // movie id -> flatrate provider ids
  region: string
  ensure: (ids: number[], region: string) => Promise<void>
}

/** Lazily fetches + caches each movie's streaming provider ids for filtering. */
export const useProvidersStore = create<ProvidersState>()((set, get) => ({
  byId: {},
  region: 'US',

  ensure: async (ids, region) => {
    // Reset cache if the region changed (availability is region-specific).
    if (region !== get().region) set({ byId: {}, region })

    const have = get().byId
    const missing = ids.filter((id) => have[id] === undefined)
    if (missing.length === 0) return

    // Fetch in small concurrent batches to avoid hammering the API.
    const batchSize = 6
    for (let i = 0; i < missing.length; i += batchSize) {
      const batch = missing.slice(i, i + batchSize)
      const results = await Promise.all(
        batch.map((id) =>
          getWatchProviderIds(id, region)
            .then((p) => [id, p] as const)
            .catch(() => [id, [] as number[]] as const),
        ),
      )
      set((s) => {
        const next = { ...s.byId }
        for (const [id, providers] of results) next[id] = providers
        return { byId: next }
      })
    }
  },
}))
