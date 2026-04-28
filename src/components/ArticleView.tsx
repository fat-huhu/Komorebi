import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  formatPostDate,
  formatReadTime,
  loadPostDetail,
  type PostDetail,
  type PostSummary,
} from '@/lib/blog'

function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? el.scrollTop / total : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

function useActiveHeading(article: PostDetail | null) {
  const [activeId, setActiveId] = useState('')
  useEffect(() => {
    if (!article) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-15% 0% -70% 0%' },
    )
    document
      .querySelectorAll('.article-prose h1, .article-prose h2, .article-prose h3')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [article])
  return activeId
}

export function ArticleView({ summary, onBack }: { summary: PostSummary; onBack: () => void }) {
  const [article, setArticle] = useState<PostDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const readProgress = useReadingProgress()
  const activeHeading = useActiveHeading(article)

  useEffect(() => {
    let isMounted = true
    loadPostDetail(summary.path)
      .then((detail) => {
        if (isMounted) setArticle(detail)
      })
      .catch((error) => {
        if (isMounted)
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
      {/* Reading progress */}
      <div
        className="fixed left-0 top-0 z-[100] h-0.5 origin-left bg-[var(--article-accent)] transition-all duration-75"
        style={{ width: `${readProgress * 100}%` }}
      />

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
              <h1 className="article-stage article-stage--title max-w-6xl text-[clamp(2rem,2vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white">
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
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block border-l pl-4 transition-colors duration-200 ${
                      activeHeading === heading.id
                        ? 'border-[var(--article-accent)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/22">
                      H{heading.depth}
                    </div>
                    <div
                      className={`mt-2 text-sm leading-6 transition-colors duration-200 ${activeHeading === heading.id ? 'text-white/80' : 'text-white/54'}`}
                    >
                      {heading.text}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
