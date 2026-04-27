import type { CSSProperties } from 'react'
import { useRef, useState } from 'react'
import { ArrowUpRight, Music, BookOpen } from 'lucide-react'
import { mapRange } from '@/lib/motion'
import { useScrollProgress } from '@/hooks/use-scroll-progress'
import { useScramble } from '@/hooks/use-scramble'
import { VoidSlash } from '@/components/VoidSlash'

const chaosElements = [
  { label: 'JAVA', x: -20, y: -30, r: 45 },
  { label: 'WEB', x: 30, y: -20, r: -15 },
  { label: 'AI', x: -40, y: 20, r: 90 },
  { label: 'HIP-HOP', x: 25, y: 40, r: -60 },
  { label: 'IGD', x: 0, y: -50, r: 180 },
  { label: 'C-NOVEL', x: 45, y: 10, r: 30 },
]

function MagneticButton({
  onClick,
  children,
  className,
}: {
  onClick: () => void
  children: React.ReactNode
  className: string
}) {
  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.28
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.28
    e.currentTarget.style.transform = `translate(${dx}px, ${dy}px)`
    e.currentTarget.style.transition = 'transform 0.1s ease'
  }
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
  return (
    <button
      onClick={onClick}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </button>
  )
}

type Particle = { id: number; x: number; y: number; vx: number; vy: number; color: string }

function ParticleBurst({ color, trigger }: { color: string; trigger: boolean }) {
  const particles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 50,
    y: 50,
    vx: Math.cos((i / 12) * Math.PI * 2) * (30 + Math.random() * 40),
    vy: Math.sin((i / 12) * Math.PI * 2) * (30 + Math.random() * 40),
    color,
  }))

  if (!trigger) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute h-1 w-1 rounded-full"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: p.color,
              '--px': `${p.vx}px`,
              '--py': `${p.vy}px`,
              animation: `particle-burst 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              animationDelay: `${Math.random() * 80}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

function WorksCard({
  delay,
  enterFrom,
  colorA,
  colorB,
  children,
  href,
  p3,
}: {
  delay: number
  enterFrom: string
  colorA: string
  colorB: string
  children: React.ReactNode
  href: string
  p3: number
}) {
  const [hovered, setHovered] = useState(false)
  const [burst, setBurst] = useState(false)
  const cardRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -18
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 18
    cardRef.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`
    cardRef.current.style.transition = 'transform 0.08s ease'
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = ''
    cardRef.current.style.transition = 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    setHovered(false)
  }

  const handleMouseEnter = () => {
    setHovered(true)
    setBurst(true)
    setTimeout(() => setBurst(false), 800)
  }

  const visible = p3 > 0.35

  return (
    <a
      ref={cardRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="works-card works-card--float group relative block cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0e0e0e] to-[#060606] p-6 backdrop-blur-xl"
      style={
        {
          '--card-color-a': colorA,
          '--card-color-b': colorB,
          '--card-enter-transform': enterFrom,
          '--card-settle-transform': 'translate(0, -8px)',
          animationDelay: `${delay}ms`,
          opacity: visible ? undefined : 0,
          pointerEvents: visible ? 'auto' : 'none',
        } as CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div className="works-card__holo" />
      <div className="works-card__scanline" />
      <ParticleBurst color={colorA} trigger={burst} />

      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${colorA}22, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {children}

      <div
        className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition-all duration-300 group-hover:border-[var(--card-color-a)] group-hover:bg-[var(--card-color-a)]/10"
        style={{ '--card-color-a': colorA } as CSSProperties}
      >
        <ArrowUpRight
          className="h-3.5 w-3.5 text-white/40 transition-colors duration-300 group-hover:text-[var(--card-color-a)]"
          strokeWidth={2}
          style={{ '--card-color-a': colorA } as CSSProperties}
        />
      </div>
    </a>
  )
}

export function HomeExperience({ onEnterJournal }: { onEnterJournal: () => void }) {
  const { scrollY: scrollProgress, vh } = useScrollProgress()
  const scrambledTitle = useScramble('WENHE', 1100)
  const heroRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const contentStageRef = useRef<HTMLDivElement>(null)

  const getSectionProgress = (startVh: number, durationVh: number) => {
    const start = startVh * vh
    const end = start + durationVh * vh
    return mapRange(scrollProgress, start, end, 0, 1)
  }

  const p1 = getSectionProgress(0, 3)

  // Sections 2-4 start after the spacer (300vh spacer = 3 * vh)
  const p2 = getSectionProgress(3, 4)
  const p3 = getSectionProgress(7, 3)
  const p4 = getSectionProgress(10, 2)
  const p2Visual = Math.max(p2, mapRange(p1, 0.9, 1, 0, 0.18))

  return (
    <div className="relative w-full bg-[#050505] text-[#eaeaea] selection:bg-orange-500 selection:text-black">
      {/* ── Fixed nav & HUD ─────────────────────────────────────────────── */}
      <MagneticButton
        onClick={onEnterJournal}
        className="fixed right-6 top-6 z-[60] flex items-center gap-3 border border-white/12 bg-black/45 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.38em] text-white/88 backdrop-blur-xl transition duration-500 hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-orange-500/10 hover:text-white"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.95)]" />
        Journal Index
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.7} />
      </MagneticButton>

      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* ── HERO: fixed on top, z-index 10 ──────────────────────────────── */}
      <div
        ref={heroRef}
        className="fixed inset-0 z-[10] flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
      >
        <div className="relative z-[5] text-center mix-blend-color-dodge">
          <h1
            className="text-[8vw] font-black leading-none tracking-tight will-change-transform"
            style={{
              transform: `scale(${mapRange(scrollProgress, 0, vh * 0.4, 1, 1.08)})`,
            }}
          >
            {scrambledTitle}
          </h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-[1em] text-orange-500">
            Personal Homepage
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[4] flex items-end justify-center pb-16">
          <div className="flex flex-col items-center gap-3 text-white/30">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em]">
              Scroll to Shatter
            </span>
            <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </div>

      {/* ── SCROLL SPACER: drives the VoidSlash timeline ────────────────── */}
      {/* 300vh = the entire shatter animation scroll distance */}
      <div ref={spacerRef} style={{ height: '300vh' }} className="relative z-[1]" />

      {/* VoidSlash overlays — fixed, outside hero so hero opacity doesn't clip them */}
      <VoidSlash heroRef={heroRef} spacerRef={spacerRef} contentRef={contentStageRef} />

      {/* ── THE VOID: pure black fixed layer between hero and content ───────── */}
      {/* Sits at z-[3], above content (z-[2]) but below hero (z-[10]).         */}
      {/* VoidSlash hides this when content is revealed.                        */}
      <div className="fixed inset-0 z-[3] bg-black" id="void-layer" />

      {/* ── REST OF PAGE: revealed by VoidSlash after shatter ───────────────── */}
      <div ref={contentRef} className="relative z-[2]" style={{ minHeight: '950vh' }}>
        <div ref={contentStageRef} className="relative overflow-hidden opacity-0">
          {/* Section 2 — Skills */}
          <div style={{ height: '400vh' }} className="relative bg-[#eaeaea] text-black">
          <div className="perspective-[1000px] sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-10 flex w-full justify-between border-b border-black/10 px-10 pb-4 text-xs font-bold uppercase tracking-widest">
              <span>Phase II</span>
              <span>Skills / Creative Focus</span>
              <span>Status: Available</span>
            </div>
            <div className="relative flex h-full w-full items-center justify-center">
              <div
                className="z-20 h-32 w-px bg-black/20"
                style={{ transform: `scaleY(${mapRange(p2Visual, 0, 0.2, 0, 1)})` }}
              />
              {chaosElements.map((item, i) => {
                const randomX = item.x * 10
                const randomY = item.y * 10
                const randomR = item.r * 2
                const gridCol = (i % 3) - 1
                const gridRow = Math.floor(i / 3) - 0.5
                const snapX = gridCol * 150
                const snapY = gridRow * 150
                const currentX = mapRange(p2Visual, 0, 0.6, randomX, snapX)
                const currentY = mapRange(p2Visual, 0, 0.6, randomY, snapY)
                const currentR = mapRange(p2Visual, 0, 0.6, randomR + p2Visual * 360, 0)
                const currentScale = mapRange(p2Visual, 0, 0.6, 1.5, 1)
                return (
                  <div
                    key={item.label}
                    className="absolute flex h-24 w-36 items-center justify-center border border-black/80 bg-white/50 backdrop-blur-sm"
                    style={{
                      transform: `translate(${currentX}px, ${currentY}px) rotate(${currentR}deg) scale(${currentScale})`,
                      opacity: mapRange(p2Visual, 0, 0.1, 0, 1),
                    }}
                  >
                    <span className="text-3xl font-bold">{item.label}</span>
                  </div>
                )
              })}
              <h2
                className="absolute z-30 text-7xl font-black tracking-tight text-white opacity-0 mix-blend-difference"
                style={{
                  opacity: mapRange(p2Visual, 0.65, 0.75, 0, 1),
                  transform: `scale(${mapRange(p2Visual, 0.6, 0.8, 0.8, 1)})`,
                }}
              >
                PROFILE
              </h2>
            </div>
          </div>
        </div>

        {/* Section 3 — Works + About */}
        <div style={{ height: '300vh' }} className="relative bg-[#050505] text-white">
          <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '60px 60px',
                transform: `translateY(${mapRange(p3, 0, 0.7, 0, 80)}px) rotateX(55deg)`,
                transformOrigin: 'center top',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 20% 50%, #a855f722, transparent 55%),
                             radial-gradient(ellipse 60% 50% at 80% 50%, #f9731618, transparent 50%)`,
                opacity: mapRange(p3, 0.2, 0.8, 0, 1),
              }}
            />
            <div
              className="relative z-10 w-full max-w-6xl px-6"
              style={{
                opacity: mapRange(p3, 0.1, 0.4, 0, 1),
                transform: `translateY(${mapRange(p3, 0.1, 0.4, 40, 0)}px)`,
              }}
            >
              <div className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.46em] text-white/30">
                <span className="inline-flex h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
                Works & Identity
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <WorksCard
                  delay={0}
                  enterFrom="translate(-120px, 60px) rotateY(-35deg)"
                  colorA="#a855f7"
                  colorB="#7c3aed"
                  href="https://u.cmread.com/oZi6v5i"
                  p3={p3}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 ring-1 ring-purple-500/30">
                      <BookOpen className="h-5 w-5 text-purple-400" strokeWidth={1.6} />
                    </div>
                    <div className="flex gap-1.5">
                      <span
                        className="works-card__tag"
                        style={{ '--card-color-a': '#a855f7' } as CSSProperties}
                      >
                        玄幻
                      </span>
                      <span
                        className="works-card__tag"
                        style={{ '--card-color-a': '#a855f7' } as CSSProperties}
                      >
                        穿越
                      </span>
                    </div>
                  </div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.38em] text-purple-400/60">
                    C-Novel · 咪咕阅读
                  </div>
                  <h3 className="mb-3 text-base font-bold leading-snug tracking-tight text-white">
                    穿越成百岁老头儿，
                    <br />
                    拄拐横扫异界
                  </h3>
                  <p className="text-[13px] leading-6 text-white/48">
                    修真界向来是年少英才的天下，谁见过七百岁的老头逆天改命？
                  </p>
                </WorksCard>

                <div
                  className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111] to-[#060606] p-6 shadow-2xl"
                  style={{
                    transform: `perspective(1000px) rotateX(${mapRange(p3, 0.1, 0.7, 14, 0)}deg) scale(${mapRange(p3, 0.1, 0.5, 0.88, 1)})`,
                    opacity: mapRange(p3, 0.15, 0.45, 0, 1),
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_55%)]" />
                  <div className="relative flex flex-col items-center justify-center py-4 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.5)]">
                      <span className="text-2xl font-black tracking-tight">WH</span>
                    </div>
                    <div className="mb-1 text-[10px] uppercase tracking-[0.42em] text-orange-400/60">
                      文和 · WENHE
                    </div>
                    <h3 className="mb-3 text-xl font-bold tracking-tight text-white">About Me</h3>
                    <p className="max-w-[200px] text-[13px] leading-6 text-white/48">
                      Web dev · Hip-hop producer · 小说作者
                    </p>
                    <div className="mt-6 flex gap-2">
                      <div className="h-1 w-2 animate-pulse rounded-full bg-orange-500" />
                      <div className="h-1 w-8 rounded-full bg-white/10" />
                      <div className="h-1 w-2 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>

                <WorksCard
                  delay={80}
                  enterFrom="translate(120px, 60px) rotateY(35deg)"
                  colorA="#06b6d4"
                  colorB="#0ea5e9"
                  href="https://music.163.com/#/artist?id=12373549"
                  p3={p3}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
                      <Music className="h-5 w-5 text-cyan-400" strokeWidth={1.6} />
                    </div>
                    <div className="flex gap-1.5">
                      <span
                        className="works-card__tag"
                        style={{ '--card-color-a': '#06b6d4' } as CSSProperties}
                      >
                        Hip-Hop
                      </span>
                      <span
                        className="works-card__tag"
                        style={{ '--card-color-a': '#06b6d4' } as CSSProperties}
                      >
                        电子
                      </span>
                    </div>
                  </div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.38em] text-cyan-400/60">
                    Music · 网易云音乐
                  </div>
                  <h3 className="mb-3 text-base font-bold leading-snug tracking-tight text-white">
                    文和 <span className="text-cyan-400">/ WENHE</span>
                  </h3>
                  <p className="text-[13px] leading-6 text-white/48">
                    十九流 hiphop 音乐制作人，做点不一样的。
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3].map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full bg-cyan-400/60"
                        style={{
                          height: `${h * 20 + 4}px`,
                          animation: `card-float ${1.2 + i * 0.15}s ease-in-out infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                </WorksCard>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 — Contact */}
        <div style={{ height: '200vh' }} className="relative overflow-hidden bg-black">
          <div className="sticky top-0 flex h-screen flex-col items-center justify-center">
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 w-0.5 rounded-full bg-white"
                  style={{
                    left: `${((i * 37) % 100) + Math.sin(i * 1.4) * 2}%`,
                    height: `${90 + (i % 5) * 16}px`,
                    transformOrigin: 'center',
                    transform: `rotate(${i * 18}deg) translateY(${mapRange(p4, 0, 1, 200, 1000)}px)`,
                    opacity: mapRange(p4, 0, 0.5, 0, 0.8),
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <h1
                className="absolute inset-0 text-center text-[10vw] font-black leading-none text-red-500 mix-blend-screen"
                style={{
                  transform: `translateX(${mapRange(p4, 0, 1, -10, 0)}px) scale(${mapRange(p4, 0, 1, 0.9, 1)})`,
                }}
              >
                CONTACT
              </h1>
              <h1
                className="absolute inset-0 text-center text-[10vw] font-black leading-none text-cyan-500 mix-blend-screen"
                style={{
                  transform: `translateX(${mapRange(p4, 0, 1, 10, 0)}px) scale(${mapRange(p4, 0, 1, 1.1, 1)})`,
                }}
              >
                CONTACT
              </h1>
              <h1 className="relative text-center text-[10vw] font-black leading-none text-white mix-blend-overlay">
                CONTACT
              </h1>
            </div>
            <div
              className="z-50 mt-12 flex flex-col items-center gap-4"
              style={{
                opacity: mapRange(p4, 0.8, 1, 0, 1),
                transform: `translateY(${mapRange(p4, 0.8, 1, 50, 0)}px)`,
              }}
            >
              <button
                onClick={onEnterJournal}
                className="group relative overflow-hidden border border-white/15 bg-white px-8 py-4 font-bold tracking-[0.28em] text-black transition-colors duration-300 hover:border-orange-400"
              >
                <span className="relative z-10 inline-flex items-center gap-3">
                  Enter Journal
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="absolute inset-0 origin-left scale-x-0 bg-orange-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 text-[11px] uppercase tracking-[0.42em] text-white/45 transition hover:text-white"
              >
                Back To Top
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[50vh] items-center justify-center bg-black">
          <p className="font-mono text-xs text-gray-700">WENHE / OPEN TO COLLABORATION</p>
        </div>
      </div>
      </div>
    </div>
  )
}
