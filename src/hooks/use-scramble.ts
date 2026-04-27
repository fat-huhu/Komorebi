import { useEffect, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function useScramble(target: string, duration = 900) {
  const [text, setText] = useState(() =>
    target
      .split('')
      .map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]))
      .join(''),
  )

  useEffect(() => {
    let frame = 0
    const totalFrames = Math.floor(duration / 16)
    let rafId: number

    const animate = () => {
      frame++
      const progress = frame / totalFrames
      setText(
        target
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i / target.length < progress) return char
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join(''),
      )
      if (frame < totalFrames) rafId = requestAnimationFrame(animate)
      else setText(target)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])

  return text
}
