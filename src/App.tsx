import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { BorderBeam } from 'border-beam'
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react'
import {
  fallbackFilter,
  formatPostDate,
  formatReadTime,
  loadPostDetail,
  loadPostsManifest,
  loadSearchIndex,
  searchPosts,
  type PostDetail,
  type PostSummary,
  type SearchIndex,
} from '@/lib/blog'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const mapRange = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  clampOutput = true,
) => {
  if (Math.abs(inputMin - inputMax) < Number.EPSILON) return outputMin
  const outVal = ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin
  return clampOutput
    ? clamp(outVal, Math.min(outputMin, outputMax), Math.max(outputMin, outputMax))
    : outVal
}

type View = 'home' | 'journal' | 'article'
type TransitionState = 'idle' | 'to-journal' | 'to-home'

type ArticleLaunch = {
  left: number
  top: number
  width: number
  height: number
  scaleX: number
  scaleY: number
  accent: string
  title: string
  category: string
  indexLabel: string
}

function HomeExperience({ onEnterJournal }: { onEnterJournal: () => void }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [vh, setVh] = useState(0)

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight)
    handleResize()
    window.addEventListener('resize', handleResize)

    let rafId = 0
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollProgress(window.scrollY)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const totalHeightVh = 1100

  const getSectionProgress = (startVh: number, durationVh: number) => {
    const start = startVh * vh
    const end = start + durationVh * vh
    return mapRange(scrollProgress, start, end, 0, 1)
  }

  const p1 = getSectionProgress(0, 2)
  const p2 = getSectionProgress(2, 4)
  const p3 = getSectionProgress(6, 3)
  const p4 = getSectionProgress(9, 2)

  const chaosElements = useMemo(
    () => [
      { label: 'JAVA', x: -20, y: -30, r: 45 },
      { label: 'WEB', x: 30, y: -20, r: -15 },
      { label: 'AI', x: -40, y: 20, r: 90 },
      { label: 'Arr.', x: 25, y: 40, r: -60 },
      { label: 'IGD', x: 0, y: -50, r: 180 },
      { label: 'C-Novel', x: 45, y: 10, r: 30 },
    ],
    [],
  )

  return (
    <div className="relative w-full overflow-x-clip bg-[#050505] text-[#eaeaea] selection:bg-orange-500 selection:text-black">
      <button
        onClick={onEnterJournal}
        className="fixed right-6 top-6 z-[60] flex items-center gap-3 border border-white/12 bg-black/45 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.38em] text-white/88 backdrop-blur-xl transition duration-500 hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-orange-500/10 hover:text-white"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.95)]" />
        Journal Index
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.7} />
      </button>

      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      <div
        className="fixed left-0 top-0 z-50 h-1 bg-orange-500 transition-all duration-75"
        style={{ width: `${(scrollProgress / ((totalHeightVh / 100) * vh)) * 100}%` }}
      />

      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-1 font-mono text-xs tracking-widest opacity-60 mix-blend-difference">
        <span>Y: {Math.floor(scrollProgress)}</span>
        <span>
          SECTOR:{' '}
          {p1 > 0 && p1 < 1 ? '01' : p2 > 0 && p2 < 1 ? '02' : p3 > 0 && p3 < 1 ? '03' : '04'}
        </span>
      </div>

      <div style={{ height: '200vh' }} className="relative z-10">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-50"
            style={{ opacity: mapRange(p1, 0.5, 1, 1, 0) }}
          />

          <div className="relative z-10 text-center mix-blend-color-dodge">
            <h1
              className="text-[12vw] font-black leading-none tracking-tight will-change-transform"
              style={{
                transform: `scale(${mapRange(p1, 0, 0.8, 0.5, 25)})`,
                opacity: mapRange(p1, 0.6, 0.8, 1, 0),
              }}
            >
              WENHE
            </h1>
            <p
              className="mt-4 font-mono text-sm uppercase tracking-[1em] text-orange-500"
              style={{
                opacity: mapRange(p1, 0, 0.3, 1, 0),
                transform: `translateY(${mapRange(p1, 0, 0.3, 0, -50)}px)`,
              }}
            >
              Personal Homepage
            </p>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p
              className="max-w-4xl text-center text-4xl font-light leading-tight tracking-tight md:text-6xl"
              style={{
                opacity: mapRange(p1, 0.7, 0.9, 0, 1),
                transform: `scale(${mapRange(p1, 0.7, 1, 0.9, 1.1)})`,
              }}
            >
              It starts with a{' '}
              <span className="font-serif italic text-orange-400">personal vision</span>.
              <br />A homepage shaped by design, code, and visual storytelling.
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: '400vh' }} className="relative z-10 bg-[#eaeaea] text-black">
        <div className="perspective-[1000px] sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-10 flex w-full justify-between border-b border-black/10 px-10 pb-4 text-xs font-bold uppercase tracking-widest">
            <span>Phase II</span>
            <span>Skills / Creative Focus</span>
            <span>Status: Available</span>
          </div>

          <div className="relative flex h-full w-full items-center justify-center">
            <div
              className="z-20 h-32 w-px bg-black/20"
              style={{ transform: `scaleY(${mapRange(p2, 0, 0.2, 0, 1)})` }}
            />

            {chaosElements.map((item, i) => {
              const randomX = item.x * 10
              const randomY = item.y * 10
              const randomR = item.r * 2
              const gridCol = (i % 3) - 1
              const gridRow = Math.floor(i / 3) - 0.5
              const snapX = gridCol * 150
              const snapY = gridRow * 150
              const currentX = mapRange(p2, 0, 0.6, randomX, snapX)
              const currentY = mapRange(p2, 0, 0.6, randomY, snapY)
              const currentR = mapRange(p2, 0, 0.6, randomR + p2 * 360, 0)
              const currentScale = mapRange(p2, 0, 0.6, 1.5, 1)

              return (
                <div
                  key={item.label}
                  className="absolute flex h-24 w-36 items-center justify-center border border-black/80 bg-white/50 backdrop-blur-sm"
                  style={{
                    transform: `translate(${currentX}px, ${currentY}px) rotate(${currentR}deg) scale(${currentScale})`,
                    opacity: mapRange(p2, 0, 0.1, 0, 1),
                  }}
                >
                  <span className="text-4xl">{item.label}</span>
                </div>
              )
            })}

            <h2
              className="absolute z-30 text-9xl font-black tracking-tight text-white opacity-0 mix-blend-difference"
              style={{
                opacity: mapRange(p2, 0.65, 0.75, 0, 1),
                transform: `scale(${mapRange(p2, 0.6, 0.8, 0.8, 1)})`,
              }}
            >
              PROFILE
            </h2>
          </div>
        </div>
      </div>

      <div
        style={{ height: '300vh' }}
        className="perspective-[1000px] relative z-10 bg-[#0a0a0a] text-white"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              transform: `translateY(${mapRange(p3, 0, 0.7, 0, 100)}px) rotateX(60deg)`,
              transformOrigin: 'center top',
            }}
          />

          <div className="relative">
            <div
              className="relative h-[400px] w-[600px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/40 to-black/40 shadow-2xl backdrop-blur-xl"
              style={{
                transform: `perspective(1000px) rotateX(${mapRange(p3, 0, 0.7, 20, 0)}deg) rotateY(${mapRange(
                  p3,
                  0,
                  0.7,
                  -20,
                  0,
                )}deg) scale(${mapRange(p3, 0, 0.7, 0.8, 1)})`,
              }}
            >
              <div
                className="absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
                style={{
                  transform: `translateX(${mapRange(p3, 0, 0.7, -100, 100)}%) skewX(-20deg)`,
                }}
              />

              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-10 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                  <span className="text-3xl font-black tracking-tight">WH</span>
                </div>
                <h3 className="mb-2 text-4xl font-bold tracking-tight">WENHE / About Me</h3>
                <p className="max-w-xs text-sm leading-relaxed text-gray-400">
                  I build expressive digital experiences across web design, creative coding, motion,
                  and personal branding.
                </p>
                <div className="mt-8 flex gap-2">
                  <div className="h-1 w-2 animate-pulse rounded-full bg-orange-500" />
                  <div className="h-1 w-8 rounded-full bg-gray-700" />
                  <div className="h-1 w-2 rounded-full bg-gray-700" />
                </div>
              </div>
            </div>

            <div
              className="absolute -inset-10 -z-10 rounded-full bg-orange-500/20 blur-3xl"
              style={{ opacity: mapRange(p3, 0.5, 1, 0, 0.5) }}
            />
          </div>
        </div>
      </div>

      <div style={{ height: '200vh' }} className="relative z-10 overflow-hidden bg-black">
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
              className="absolute inset-0 text-center text-[15vw] font-black leading-none text-red-500 mix-blend-screen"
              style={{
                transform: `translateX(${mapRange(p4, 0, 1, -10, 0)}px) scale(${mapRange(p4, 0, 1, 0.9, 1)})`,
              }}
            >
              CONTACT
            </h1>
            <h1
              className="absolute inset-0 text-center text-[15vw] font-black leading-none text-cyan-500 mix-blend-screen"
              style={{
                transform: `translateX(${mapRange(p4, 0, 1, 10, 0)}px) scale(${mapRange(p4, 0, 1, 1.1, 1)})`,
              }}
            >
              CONTACT
            </h1>
            <h1 className="relative text-center text-[15vw] font-black leading-none text-white mix-blend-overlay">
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
              className="group relative overflow-hidden border border-white/15 bg-white px-8 py-4 font-bold tracking-[0.28em] text-black transition-colors duration-300 hover:border-orange-400 hover:bg-orange-500"
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
        <p className="text-xs font-mono text-gray-700">WENHE / OPEN TO COLLABORATION</p>
      </div>
    </div>
  )
}

function JournalIndex({
  query,
  onQueryChange,
  onBack,
  onOpenArticle,
}: {
  query: string
  onQueryChange: (value: string) => void
  onBack: () => void
  onOpenArticle: (entry: PostSummary, rect: DOMRect) => void
}) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null)
  const [isManifestLoading, setIsManifestLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setPointer({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  useEffect(() => {
    let isMounted = true

    loadPostsManifest()
      .then((manifest) => {
        if (!isMounted) return
        setPosts(manifest.posts)
      })
      .catch((error) => {
        if (!isMounted) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load posts manifest.')
      })
      .finally(() => {
        if (!isMounted) return
        setIsManifestLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!query.trim() || searchIndex) return

    let isMounted = true

    loadSearchIndex()
      .then((index) => {
        if (!isMounted) return
        setSearchIndex(index)
      })
      .catch((error) => {
        if (!isMounted) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load search index.')
      })

    return () => {
      isMounted = false
    }
  }, [query, searchIndex])

  const isSearchLoading = Boolean(query.trim()) && !searchIndex && !loadError

  const filteredEntries = useMemo(() => {
    if (!query.trim()) return posts
    if (searchIndex) return searchPosts(searchIndex, query)
    return fallbackFilter(posts, query)
  }, [posts, query, searchIndex])

  return (
    <div className="journal-shell relative min-h-screen overflow-hidden bg-[#090909] text-[#f5f1ea]">
      <div
        className="pointer-events-none absolute inset-0 opacity-90 transition duration-300"
        style={{
          background: `radial-gradient(440px circle at ${pointer.x}px ${pointer.y}px, rgba(255,138,61,0.16), transparent 55%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 pb-12 pt-6 md:px-10 lg:px-14">
        <header className="flex flex-col gap-8 border-b border-white/8 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]">
            <button
              onClick={onBack}
              className="mb-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.42em] text-white/52 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Return
            </button>

            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.46em] text-white/40">
              <span className="inline-flex h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.95)]" />
              Editorial Index
            </div>

            <h1 className="max-w-[920px] text-[clamp(3rem,9vw,8.5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-white">
              Journal
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
              Notes on motion, layout systems, visual identity, and frontend craft. Built as an
              index, not a feed.
            </p>
          </div>

          <div className="w-full max-w-105 lg:pb-2">
            <div className="journal-search-shell rounded-[28px] p-px">
              <BorderBeam
                size="line"
                theme="dark"
                colorVariant="colorful"
                strength={0.74}
                brightness={1.08}
                saturation={0.9}
                hueRange={16}
                duration={2.4}
                borderRadius={28}
                className="journal-search rounded-[28px]"
              >
                <label className="journal-search-inner flex items-center gap-4 rounded-[27px] border border-white/10 bg-[#17110d]/92 px-4 py-4 backdrop-blur-xl transition duration-500 focus-within:bg-[#1a120e]/96">
                  <Search className="h-5 w-5 text-white/44" strokeWidth={1.7} />
                  <input
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search title, topic, tag"
                    className="w-full bg-transparent text-sm tracking-[0.08em] text-white outline-none placeholder:text-white/26"
                  />
                </label>
              </BorderBeam>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-white/8 py-5 text-[11px] uppercase tracking-[0.38em] text-white/36">
          <span>{filteredEntries.length.toString().padStart(2, '0')} Articles Visible</span>
          <span>{isSearchLoading ? 'Indexing Search' : 'Static Markdown Archive'}</span>
        </div>

        {loadError ? (
          <div className="border-b border-dashed border-white/10 py-6 text-sm text-amber-200/72">
            {loadError}
          </div>
        ) : null}

        {isManifestLoading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <div className="border border-dashed border-white/10 px-8 py-12 text-center">
              <div className="text-[11px] uppercase tracking-[0.42em] text-white/28">Loading</div>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/52">
                Reading local Markdown manifest and preparing the archive index.
              </p>
            </div>
          </div>
        ) : null}

        <main className={`divide-y divide-white/8 ${isManifestLoading ? 'hidden' : ''}`}>
          {filteredEntries.map((entry) => (
            <article
              key={entry.slug}
              className="journal-row group relative grid cursor-pointer gap-6 py-7 transition duration-500 md:grid-cols-[88px_minmax(0,1fr)_220px] md:items-end"
              style={{ '--journal-accent': entry.accent } as CSSProperties}
              onClick={(event) => onOpenArticle(entry, event.currentTarget.getBoundingClientRect())}
            >
              <div className="flex items-start justify-between md:block">
                <span className="text-[11px] uppercase tracking-[0.42em] text-white/28">
                  {entry.indexLabel}
                </span>
                <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/50 md:mt-4">
                  {entry.category}
                </span>
              </div>

              <div className="relative">
                <div className="absolute -left-5 top-0 h-full w-px origin-top scale-y-0 bg-[var(--journal-accent)] opacity-70 transition duration-500 group-hover:scale-y-100" />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 className="text-[clamp(1.8rem,4vw,3.7rem)] font-semibold leading-[0.96] tracking-[-0.035em] text-white transition duration-500 group-hover:translate-x-2">
                    {entry.title}
                  </h2>
                  <ArrowUpRight
                    className="journal-arrow mt-1 h-6 w-6 text-white/30 transition duration-500 group-hover:text-[var(--journal-accent)]"
                    strokeWidth={1.6}
                  />
                </div>

                <div className="journal-signal mt-4">
                  <span className="journal-signal__line" />
                  <span className="journal-signal__bar" />
                  <span className="journal-signal__pulse" />
                </div>

                <p className="mt-6 max-w-3xl text-sm leading-7 text-white/56 md:text-[15px]">
                  {entry.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end md:text-right">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.36em] text-white/26">
                    {formatPostDate(entry.date)}
                  </div>
                  <div className="mt-2 text-sm text-white/56">
                    {formatReadTime(entry.readingTime)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/38 transition duration-500 group-hover:border-[color:var(--journal-accent)]/35 group-hover:text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </main>

        {!isManifestLoading && filteredEntries.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <div className="border border-dashed border-white/10 px-8 py-12 text-center">
              <div className="text-[11px] uppercase tracking-[0.42em] text-white/28">No Match</div>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/52">
                Tighten the keywords or search by category, motion topic, or article phrase.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ArticleView({ summary, onBack }: { summary: PostSummary; onBack: () => void }) {
  const [article, setArticle] = useState<PostDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    loadPostDetail(summary.path)
      .then((detail) => {
        if (!isMounted) return
        setArticle(detail)
      })
      .catch((error) => {
        if (!isMounted) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load article.')
      })

    return () => {
      isMounted = false
    }
  }, [summary.path])

  const detail = article ?? summary

  return (
    <div
      className="article-shell relative min-h-screen overflow-hidden bg-[#060606] text-[#f8f4ed]"
      style={{ '--article-accent': summary.accent } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,136,52,0.18),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(110,231,255,0.12),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(213,108,255,0.14),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-[0.05]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <div className="relative z-10 mx-auto max-w-[1560px] px-6 pb-24 pt-6 md:px-10 lg:px-14">
        <div className="article-stage article-stage--hero border-b border-white/8 pb-10">
          <div className="flex items-start justify-between gap-6">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.42em] text-white/52 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Back To Index
            </button>

            <div className="hidden items-center gap-3 text-[10px] uppercase tracking-[0.36em] text-white/34 lg:flex">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--article-accent)] shadow-[0_0_18px_var(--article-accent)]" />
              Full Article Render
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <div className="article-kicker mb-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.42em] text-white/34">
                <span>{detail.indexLabel}</span>
                <span className="h-px flex-1 bg-white/10" />
                <span>{detail.category}</span>
              </div>

              <h1 className="article-stage article-stage--title max-w-6xl text-[clamp(3.1rem,8vw,8rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white">
                {detail.title}
              </h1>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] uppercase tracking-[0.34em] text-white/36">
                <span>{formatPostDate(detail.date)}</span>
                {detail.updated ? <span>Updated {formatPostDate(detail.updated)}</span> : null}
                <span>{formatReadTime(detail.readingTime)}</span>
              </div>

              <p className="article-stage article-stage--summary mt-8 max-w-3xl text-base leading-8 text-white/62 md:text-[17px]">
                {detail.summary}
              </p>
            </div>

            <div className="article-stage article-stage--panel relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),transparent_45%,rgba(255,255,255,0.02))]" />
              <div className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.34em] text-white/36">
                <span>Archive Node</span>
                <span>{detail.lang}</span>
              </div>
              <div className="relative mt-8 space-y-5">
                {detail.headings.slice(0, 4).map((heading) => (
                  <div key={heading.id} className="flex items-start gap-4">
                    <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-[var(--article-accent)]" />
                    <span className="text-sm leading-6 text-white/54">{heading.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,920px)_220px]">
          <aside className="article-stage article-stage--rail lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.025] p-5 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.34em] text-white/28">Signals</div>
              <div className="mt-5 flex flex-wrap gap-2">
                {detail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/48"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {detail.media.length > 0 ? (
                <div className="mt-8">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-white/28">Media</div>
                  <div className="mt-4 space-y-3">
                    {detail.media.map((item) => (
                      <div
                        key={item.src}
                        className="rounded-2xl border border-white/8 bg-black/20 p-3 text-xs text-white/44"
                      >
                        {item.fileName}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>

          <main className="article-stage article-stage--body">
            {loadError ? (
              <div className="rounded-[28px] border border-dashed border-white/10 px-8 py-10 text-sm text-amber-200/72">
                {loadError}
              </div>
            ) : article ? (
              <article
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: article.html }}
              />
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 px-8 py-12">
                <div className="text-[11px] uppercase tracking-[0.42em] text-white/28">
                  Loading Article
                </div>
                <div className="article-loading-bar mt-6 h-[3px] overflow-hidden rounded-full bg-white/8">
                  <span className="block h-full w-40 article-loading-bar__fill rounded-full bg-[var(--article-accent)]" />
                </div>
              </div>
            )}
          </main>

          <aside className="article-stage article-stage--meta hidden xl:block">
            <div className="sticky top-8 rounded-[24px] border border-white/8 bg-white/[0.025] p-5 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.34em] text-white/28">
                Reading Trace
              </div>
              <div className="mt-5 space-y-6">
                {detail.headings.map((heading) => (
                  <div key={heading.id} className="border-l border-white/10 pl-4">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/22">
                      H{heading.depth}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/54">{heading.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function App() {
  const [view, setView] = useState<View>('home')
  const [transitionState, setTransitionState] = useState<TransitionState>('idle')
  const [query, setQuery] = useState('')
  const [activeArticle, setActiveArticle] = useState<PostSummary | null>(null)
  const [articleLaunch, setArticleLaunch] = useState<ArticleLaunch | null>(null)

  const openJournal = () => {
    setTransitionState('to-journal')
    window.setTimeout(() => {
      setView('journal')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }, 320)
    window.setTimeout(() => setTransitionState('idle'), 780)
  }

  const closeJournal = () => {
    setTransitionState('to-home')
    window.setTimeout(() => {
      setView('home')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }, 320)
    window.setTimeout(() => setTransitionState('idle'), 780)
  }

  const openArticle = (entry: PostSummary, rect: DOMRect) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    setArticleLaunch({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      scaleX: viewportWidth / rect.width,
      scaleY: viewportHeight / rect.height,
      accent: entry.accent,
      title: entry.title,
      category: entry.category,
      indexLabel: entry.indexLabel,
    })
    setActiveArticle(entry)

    window.setTimeout(() => {
      setView('article')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }, 220)

    window.setTimeout(() => {
      setArticleLaunch(null)
    }, 1180)
  }

  const closeArticle = () => {
    setView('journal')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[120] bg-[#050505] transition duration-700 ${
          transitionState === 'idle'
            ? 'pointer-events-none opacity-0'
            : 'pointer-events-auto opacity-100 journal-transition-mask'
        }`}
      />

      <div
        className={`transition duration-700 ${view === 'home' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {view === 'home' ? <HomeExperience onEnterJournal={openJournal} /> : null}
      </div>

      <div
        className={`transition duration-700 ${view === 'journal' || view === 'article' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {view === 'journal' ? (
          <JournalIndex
            query={query}
            onQueryChange={setQuery}
            onBack={closeJournal}
            onOpenArticle={openArticle}
          />
        ) : null}
      </div>

      <div
        className={`transition duration-700 ${view === 'article' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {view === 'article' && activeArticle ? (
          <ArticleView key={activeArticle.slug} summary={activeArticle} onBack={closeArticle} />
        ) : null}
      </div>

      {articleLaunch ? (
        <div className="pointer-events-none fixed inset-0 z-[140] overflow-hidden">
          <div
            className="article-launch"
            style={
              {
                '--launch-x': `${articleLaunch.left}px`,
                '--launch-y': `${articleLaunch.top}px`,
                '--launch-width': `${articleLaunch.width}px`,
                '--launch-height': `${articleLaunch.height}px`,
                '--launch-scale-x': articleLaunch.scaleX,
                '--launch-scale-y': articleLaunch.scaleY,
                '--launch-accent': articleLaunch.accent,
              } as CSSProperties
            }
          >
            <div className="article-launch__surface" />
            <div className="article-launch__beam" />
            <div className="article-launch__label">
              <span>{articleLaunch.indexLabel}</span>
              <span>{articleLaunch.category}</span>
            </div>
            <div className="article-launch__title">{articleLaunch.title}</div>
          </div>
        </div>
      ) : null}
    </>
  )
}
