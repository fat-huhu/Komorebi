import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { BorderBeam } from 'border-beam'
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react'
import {
  fallbackFilter,
  formatPostDate,
  formatReadTime,
  loadPostsManifest,
  loadSearchIndex,
  searchPosts,
  type PostSummary,
  type SearchIndex,
} from '@/lib/blog'

export function JournalIndex({
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
    const handleMove = (e: MouseEvent) => setPointer({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  useEffect(() => {
    let isMounted = true
    loadPostsManifest()
      .then((manifest) => { if (isMounted) setPosts(manifest.posts) })
      .catch((error) => { if (isMounted) setLoadError(error instanceof Error ? error.message : 'Unable to load posts manifest.') })
      .finally(() => { if (isMounted) setIsManifestLoading(false) })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!query.trim() || searchIndex) return
    let isMounted = true
    loadSearchIndex()
      .then((index) => { if (isMounted) setSearchIndex(index) })
      .catch((error) => { if (isMounted) setLoadError(error instanceof Error ? error.message : 'Unable to load search index.') })
    return () => { isMounted = false }
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
            <h1 className="max-w-230 text-[clamp(2rem,5.5vw,5.5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-white">
              Journal
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
              Notes on motion, layout systems, visual identity, and frontend craft. Built as an index, not a feed.
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
                    onChange={(e) => onQueryChange(e.target.value)}
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
          <div className="border-b border-dashed border-white/10 py-6 text-sm text-amber-200/72">{loadError}</div>
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
          {filteredEntries.map((entry, index) => (
            <article
              key={entry.slug}
              className="journal-row journal-row-enter group relative grid cursor-pointer gap-6 py-7 transition duration-500 md:grid-cols-[88px_minmax(0,1fr)_220px] md:items-end"
              style={{ '--journal-accent': entry.accent, animationDelay: `${Math.min(index, 9) * 55}ms` } as CSSProperties}
              onClick={(e) => onOpenArticle(entry, e.currentTarget.getBoundingClientRect())}
            >
              <div className="flex items-start justify-between md:block">
                <span className="text-[11px] uppercase tracking-[0.42em] text-white/28">{entry.indexLabel}</span>
                <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/50 md:mt-4">
                  {entry.category}
                </span>
              </div>
              <div className="relative">
                <div className="absolute -left-5 top-0 h-full w-px origin-top scale-y-0 bg-[var(--journal-accent)] opacity-70 transition duration-500 group-hover:scale-y-100" />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 className="text-[clamp(1.2rem,2.5vw,2.5rem)] font-semibold leading-[0.96] tracking-[-0.035em] text-white transition duration-500 group-hover:translate-x-2">
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
                <p className="mt-6 max-w-3xl text-sm leading-7 text-white/56 md:text-[15px]">{entry.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end md:text-right">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.36em] text-white/26">{formatPostDate(entry.date)}</div>
                  <div className="mt-2 text-sm text-white/56">{formatReadTime(entry.readingTime)}</div>
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
