import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether an element has scrolled near the viewport. Latches true once
 * (then disconnects) so content stays mounted after first reveal. `rootMargin`
 * preloads slightly before the element actually enters view.
 */
export function useInView<T extends HTMLElement>(rootMargin = '300px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const el = ref.current
    if (!el) return
    // No IntersectionObserver (old browser / SSR) → just show content.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          obs.disconnect()
        }
      },
      { rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [inView, rootMargin])

  return { ref, inView }
}
