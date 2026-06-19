import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Max width utility class, e.g. "max-w-lg". */
  size?: string
}

export function Modal({ open, onClose, children, size = 'max-w-2xl' }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`glass relative my-auto w-full ${size} rounded-2xl p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-text-muted transition hover:bg-white/10 hover:text-text"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
