import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../hooks/useTheme'

interface Props {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="glass grid h-10 w-10 place-items-center rounded-full text-text transition hover:text-accent"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
