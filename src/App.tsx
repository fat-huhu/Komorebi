import type { CSSProperties } from 'react'
import { useState } from 'react'
import { type PostSummary } from '@/lib/blog'
import { CursorFollower } from '@/components/CursorFollower'
import { HomeExperience } from '@/components/HomeExperience'
import { JournalIndex } from '@/components/JournalIndex'
import { ArticleView } from '@/components/ArticleView'

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
    const vw = window.innerWidth
    const vh = window.innerHeight
    setArticleLaunch({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      scaleX: vw / rect.width,
      scaleY: vh / rect.height,
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
    window.setTimeout(() => setArticleLaunch(null), 1180)
  }

  const closeArticle = () => {
    setView('journal')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return (
    <>
      <CursorFollower />

      <div
        className={`fixed inset-0 z-[120] bg-[#050505] transition duration-700 ${
          transitionState === 'idle'
            ? 'pointer-events-none opacity-0'
            : 'pointer-events-auto opacity-100 journal-transition-mask'
        }`}
      />

      <div className={`transition duration-700 ${view === 'home' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {view === 'home' ? <HomeExperience onEnterJournal={openJournal} /> : null}
      </div>

      <div className={`transition duration-700 ${view === 'journal' || view === 'article' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {view === 'journal' ? (
          <JournalIndex query={query} onQueryChange={setQuery} onBack={closeJournal} onOpenArticle={openArticle} />
        ) : null}
      </div>

      <div className={`transition duration-700 ${view === 'article' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
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
