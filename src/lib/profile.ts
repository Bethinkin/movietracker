import { create } from 'zustand'
import { supabase } from './supabase'

/** Where the hero banner pulls its backdrops from. */
export type HeroSource = 'recent' | 'collection-random' | 'tmdb-random' | 'pinned'

export interface Profile {
  id: string
  firstName: string
  lastName: string
  username: string
  country: string
  avatarUrl: string | null
  email: string
  createdAt: string
  heroSource: HeroSource
  heroCount: number
}

/** Fields the user can edit on the profiles table (email is handled separately). */
export type ProfileChanges = Partial<
  Pick<
    Profile,
    'firstName' | 'lastName' | 'username' | 'country' | 'avatarUrl' | 'heroSource' | 'heroCount'
  >
>

interface ProfileState {
  profile: Profile | null
  loading: boolean
  loadProfile: () => Promise<void>
  updateProfile: (changes: ProfileChanges) => Promise<{ error: string | null }>
  updateEmail: (email: string) => Promise<{ error: string | null }>
  uploadAvatar: (file: File) => Promise<{ error: string | null }>
  clearProfile: () => void
}

function toProfile(row: Record<string, unknown>, email: string): Profile {
  return {
    id: row.id as string,
    firstName: (row.first_name as string | null) ?? '',
    lastName: (row.last_name as string | null) ?? '',
    username: (row.username as string | null) ?? '',
    country: (row.country as string | null) ?? '',
    avatarUrl: (row.avatar_url as string | null) ?? null,
    email,
    createdAt: row.created_at as string,
    heroSource: ((row.hero_source as string | null) ?? 'recent') as HeroSource,
    heroCount: (row.hero_count as number | null) ?? 5,
  }
}

// ProfileChanges (camelCase) → DB columns (snake_case)
function toRow(changes: ProfileChanges): Record<string, unknown> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (changes.firstName !== undefined) row.first_name = changes.firstName
  if (changes.lastName !== undefined) row.last_name = changes.lastName
  if (changes.username !== undefined) row.username = changes.username || null
  if (changes.country !== undefined) row.country = changes.country
  if (changes.avatarUrl !== undefined) row.avatar_url = changes.avatarUrl
  if (changes.heroSource !== undefined) row.hero_source = changes.heroSource
  if (changes.heroCount !== undefined) row.hero_count = changes.heroCount
  return row
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: null,
  loading: false,

  loadProfile: async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      set({ profile: null, loading: false })
      return
    }

    set({ loading: true })
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[profile] load failed:', error.message, error)
      set({ loading: false })
      return
    }

    // Create an empty profile row for brand-new users.
    if (!data) {
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id })
        .select('*')
        .single()
      if (insertError) {
        console.error('[profile] create failed:', insertError.message, insertError)
        set({ loading: false })
        return
      }
      set({ profile: toProfile(created, user.email ?? ''), loading: false })
      return
    }

    set({ profile: toProfile(data, user.email ?? ''), loading: false })
  },

  updateProfile: async (changes) => {
    const prev = get().profile
    if (!prev) return { error: 'Not signed in' }

    // Optimistic update
    set({ profile: { ...prev, ...changes } })

    const { error } = await supabase
      .from('profiles')
      .update(toRow(changes))
      .eq('id', prev.id)

    if (error) {
      console.error('[profile] update failed:', error.message, error)
      set({ profile: prev }) // rollback
      const friendly =
        error.code === '23505'
          ? 'That username is already taken.'
          : error.message
      return { error: friendly }
    }
    return { error: null }
  },

  updateEmail: async (email) => {
    const { error } = await supabase.auth.updateUser({ email })
    if (error) {
      console.error('[profile] email update failed:', error.message, error)
      return { error: error.message }
    }
    return { error: null }
  },

  uploadAvatar: async (file) => {
    const prev = get().profile
    if (!prev) return { error: 'Not signed in' }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${prev.id}/avatar_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      console.error('[profile] avatar upload failed:', uploadError.message, uploadError)
      return { error: uploadError.message }
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = data.publicUrl

    return get().updateProfile({ avatarUrl })
  },

  clearProfile: () => set({ profile: null }),
}))
