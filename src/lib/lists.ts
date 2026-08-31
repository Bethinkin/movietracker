import { create } from 'zustand'
import { supabase } from './supabase'

export interface MovieList {
  id: string
  name: string
  movieIds: number[]
}

interface ListState {
  lists: MovieList[]
  loadLists: () => Promise<void>
  createList: (name: string) => Promise<void>
  renameList: (id: string, name: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  addToList: (listId: string, tmdbId: number) => Promise<void>
  removeFromList: (listId: string, tmdbId: number) => Promise<void>
  clearLists: () => void
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export const useListStore = create<ListState>()((set, get) => ({
  lists: [],

  loadLists: async () => {
    const userId = await currentUserId()
    if (!userId) { set({ lists: [] }); return }

    const { data, error } = await supabase
      .from('lists')
      .select('id, name, list_items(tmdb_id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[lists] load failed:', error.message, error)
      return
    }

    const lists: MovieList[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      movieIds: ((row.list_items as { tmdb_id: number }[] | null) ?? []).map((i) => i.tmdb_id),
    }))
    set({ lists })
  },

  createList: async (name) => {
    const userId = await currentUserId()
    if (!userId || !name.trim()) return
    const { data, error } = await supabase
      .from('lists')
      .insert({ user_id: userId, name: name.trim() })
      .select('id, name')
      .single()
    if (error) {
      console.error('[lists] create failed:', error.message, error)
      return
    }
    set((s) => ({ lists: [...s.lists, { id: data.id, name: data.name, movieIds: [] }] }))
  },

  renameList: async (id, name) => {
    const prev = get().lists
    set((s) => ({ lists: s.lists.map((l) => (l.id === id ? { ...l, name } : l)) }))
    const { error } = await supabase.from('lists').update({ name }).eq('id', id)
    if (error) {
      console.error('[lists] rename failed:', error.message, error)
      set({ lists: prev })
    }
  },

  deleteList: async (id) => {
    const prev = get().lists
    set((s) => ({ lists: s.lists.filter((l) => l.id !== id) }))
    const { error } = await supabase.from('lists').delete().eq('id', id)
    if (error) {
      console.error('[lists] delete failed:', error.message, error)
      set({ lists: prev })
    }
  },

  addToList: async (listId, tmdbId) => {
    const prev = get().lists
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId && !l.movieIds.includes(tmdbId)
          ? { ...l, movieIds: [...l.movieIds, tmdbId] }
          : l,
      ),
    }))
    const { error } = await supabase.from('list_items').insert({ list_id: listId, tmdb_id: tmdbId })
    if (error) {
      console.error('[lists] add item failed:', error.message, error)
      set({ lists: prev })
    }
  },

  removeFromList: async (listId, tmdbId) => {
    const prev = get().lists
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id === listId ? { ...l, movieIds: l.movieIds.filter((id) => id !== tmdbId) } : l,
      ),
    }))
    const { error } = await supabase
      .from('list_items')
      .delete()
      .match({ list_id: listId, tmdb_id: tmdbId })
    if (error) {
      console.error('[lists] remove item failed:', error.message, error)
      set({ lists: prev })
    }
  },

  clearLists: () => set({ lists: [] }),
}))
