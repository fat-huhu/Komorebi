import { useEffect, useRef } from 'react'

export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    let rafId: number
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 14}px, ${ring.current.y - 14}px)`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-follower pointer-events-none fixed left-0 top-0 z-[300] h-1.5 w-1.5 rounded-full bg-orange-400 opacity-70"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="cursor-follower pointer-events-none fixed left-0 top-0 z-[300] h-7 w-7 rounded-full border border-orange-400/30 mix-blend-screen"
        style={{ willChange: 'transform' }}
      />
    </>
  )
}
