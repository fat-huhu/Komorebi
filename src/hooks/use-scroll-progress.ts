import { useEffect, useState } from 'react'

export function useScrollProgress() {
  const [scrollY, setScrollY] = useState(0)
  const [vh, setVh] = useState(0)

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight)
    handleResize()
    window.addEventListener('resize', handleResize)

    let rafId = 0
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return { scrollY, vh }
}
