import { useState } from 'react'
import { Film, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function AuthDialog() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setInfo('Check your email for a confirmation link, then sign in.')
        setMode('signin')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg px-4">
      <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl sm:p-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Film size={32} className="text-accent" />
          <h1 className="text-2xl font-extralight tracking-[0.2em] uppercase">
            Movie <span className="font-bold text-accent">Tracker</span>
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-text-muted"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-panel-border bg-bg-elevated/60 px-4 py-3 text-sm text-text outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-text-muted"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-panel-border bg-bg-elevated/60 px-4 py-3 text-sm text-text outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          {info && <p role="status" className="text-sm text-accent">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
            className="text-accent underline-offset-2 hover:underline"
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
