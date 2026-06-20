import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, LogOut, Mail, User } from 'lucide-react'
import { Modal } from './Modal'
import { ThemeToggle } from './ThemeToggle'
import { ProfileStats } from './ProfileStats'
import { useProfileStore, type HeroSource } from '../lib/profile'
import { COUNTRIES } from '../lib/countries'
import type { Theme } from '../hooks/useTheme'

const HERO_SOURCES: { id: HeroSource; label: string }[] = [
  { id: 'recent', label: 'Recent additions' },
  { id: 'collection-random', label: 'Random from collection' },
  { id: 'tmdb-random', label: 'Random from TMDB' },
  { id: 'pinned', label: 'Pinned' },
]
const HERO_COUNTS = [1, 5, 10]

const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs transition ${
    active
      ? 'border-accent bg-accent/15 text-accent'
      : 'border-panel-border text-text-muted hover:border-accent/60 hover:text-text'
  }`

interface Props {
  open: boolean
  onClose: () => void
  stats: { total: number; want: number; seen: number }
  theme: Theme
  onToggleTheme: () => void
  onSignOut: () => void
}

const inputClass =
  'w-full rounded-xl border border-panel-border bg-bg-elevated/60 px-4 py-3 text-sm text-text outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent'
const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-widest text-text-muted'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(first: string, last: string, email: string): string {
  const a = first.trim()[0] ?? ''
  const b = last.trim()[0] ?? ''
  if (a || b) return (a + b).toUpperCase()
  return (email.trim()[0] ?? '?').toUpperCase()
}

export function ProfileDialog({ open, onClose, stats, theme, onToggleTheme, onSignOut }: Props) {
  const profile = useProfileStore((s) => s.profile)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const updateEmail = useProfileStore((s) => s.updateEmail)
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [country, setCountry] = useState('')
  const [email, setEmail] = useState('')

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [tab, setTab] = useState<'profile' | 'stats'>('profile')
  const fileRef = useRef<HTMLInputElement>(null)

  // Sync form from the profile when the dialog opens (keyed on id so an avatar
  // upload mid-edit doesn't wipe unsaved text changes).
  useEffect(() => {
    if (open && profile) {
      setFirstName(profile.firstName)
      setLastName(profile.lastName)
      setUsername(profile.username)
      setCountry(profile.country)
      setEmail(profile.email)
      setError(null)
      setNotice(null)
      setTab('profile')
    }
  }, [open, profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Your profile'

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    setUploading(true)
    setError(null)
    const res = await uploadAvatar(file)
    if (res.error) setError(res.error)
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setNotice(null)

    const res = await updateProfile({ firstName, lastName, username, country })
    if (res.error) {
      setError(res.error)
      setSaving(false)
      return
    }

    if (email && email !== profile?.email) {
      const er = await updateEmail(email)
      if (er.error) {
        setError(er.error)
        setSaving(false)
        return
      }
      setNotice('Check your new inbox to confirm the email change.')
      setSaving(false)
      return
    }

    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="max-w-lg">
      {/* Header: avatar + name + email */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-panel-border bg-bg-elevated">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-xl font-medium text-text-muted">
                {profile ? initials(firstName, lastName, email) : <User size={28} />}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile photo"
            className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-fg shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarPick}
            className="hidden"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-light tracking-wide">{displayName}</h2>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
              Member
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-text-muted">
            <Mail size={13} /> {profile?.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-full border border-panel-border bg-bg-elevated/50 p-1">
        {(['profile', 'stats'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm capitalize transition ${
              tab === t ? 'bg-accent text-accent-fg' : 'text-text-muted hover:text-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && <ProfileStats />}

      {tab === 'profile' && (
      <>
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-panel-border bg-panel-border sm:grid-cols-4">
        <Stat label="Member since" value={profile ? formatDate(profile.createdAt) : '—'} />
        <Stat label="Total" value={String(stats.total)} />
        <Stat label="Want" value={String(stats.want)} />
        <Stat label="Seen" value={String(stats.seen)} />
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-first" className={labelClass}>First name</label>
            <input
              id="profile-first"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-last" className={labelClass}>Last name</label>
            <input
              id="profile-last"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile-email" className={labelClass}>Email address</label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="profile-country" className={labelClass}>Country</label>
          <select
            id="profile-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={`${inputClass} cursor-pointer appearance-none`}
          >
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="profile-username" className={labelClass}>Username</label>
          <div className="flex items-center overflow-hidden rounded-xl border border-panel-border bg-bg-elevated/60 transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent">
            <span className="select-none px-3 text-sm text-text-muted">@</span>
            <input
              id="profile-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
              placeholder="username"
              className="w-full bg-transparent py-3 pr-4 text-sm text-text outline-none"
            />
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {notice && <p role="status" className="text-sm text-accent">{notice}</p>}
      </div>

      {/* Hero background preference */}
      <div className="mt-6 border-t border-panel-border pt-5">
        <p className={labelClass}>Hero background</p>
        <div className="flex flex-wrap gap-1.5">
          {HERO_SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => updateProfile({ heroSource: s.id })}
              className={chipClass((profile?.heroSource ?? 'recent') === s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className={`${labelClass} mt-4`}>How many</p>
        <div className="flex gap-1.5">
          {HERO_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => updateProfile({ heroCount: n })}
              className={chipClass((profile?.heroCount ?? 5) === n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Account options: appearance + logout */}
      <div className="mt-6 space-y-3 border-t border-panel-border pt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text">Appearance</span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2 text-sm text-text-muted transition hover:text-red-400"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-panel-border px-5 py-2.5 text-sm font-medium text-text transition hover:border-accent/60 hover:text-accent"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save changes
        </button>
      </div>
      </>
      )}
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-text">{value}</p>
    </div>
  )
}
