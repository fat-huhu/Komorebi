import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { BorderBeam } from 'border-beam'
import { ArrowLeft, ArrowUpRight, Bookmark, Boxes, Search } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import {
  fallbackFilterResources,
  formatResourceDate,
  loadResourcesManifest,
  loadResourcesSearchIndex,
  searchResources,
  type ResourceEntry,
  type ResourceSearchIndex,
} from '@/lib/resources'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const kindMeta: Record<string, { label: string; color: string }> = {
  plugin: { label: 'Plugin', color: '#ff8a3d' },
  component: { label: 'Component', color: '#6ee7ff' },
  'open-source': { label: 'Open Source', color: '#f95d9b' },
  tool: { label: 'Tool', color: '#c7ff4d' },
  library: { label: 'Library', color: '#9b8cff' },
  skill: { label: 'Skill', color: '#2dd4bf' },
}

const statusMeta: Record<string, { label: string; color: string }> = {
  using: { label: 'Using', color: '#ff8a3d' },
  marked: { label: 'Marked', color: '#6ee7ff' },
  watching: { label: 'Watching', color: '#d6a8ff' },
}

type ResourcesIndexProps = {
  query: string
  onQueryChange: (value: string) => void
  onBack: () => void
  onOpenJournal: () => void
}

export function ResourcesIndex({
  query,
  onQueryChange,
  onBack,
  onOpenJournal,
}: ResourcesIndexProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [resources, setResources] = useState<ResourceEntry[]>([])
  const [searchIndex, setSearchIndex] = useState<ResourceSearchIndex | null>(null)
  const [isManifestLoading, setIsManifestLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPointer({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  useEffect(() => {
    let isMounted = true
    loadResourcesManifest()
      .then((manifest) => {
        if (isMounted) setResources(manifest.resources)
      })
      .catch((error) => {
        if (isMounted)
          setLoadError(
            error instanceof Error ? error.message : 'Unable to load resources manifest.',
          )
      })
      .finally(() => {
        if (isMounted) setIsManifestLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!query.trim() || searchIndex) return
    let isMounted = true
    loadResourcesSearchIndex()
      .then((index) => {
        if (isMounted) setSearchIndex(index)
      })
      .catch((error) => {
        if (isMounted)
          setLoadError(
            error instanceof Error ? error.message : 'Unable to load resources search index.',
          )
      })
    return () => {
      isMounted = false
    }
  }, [query, searchIndex])

  const isSearchLoading = Boolean(query.trim()) && !searchIndex && !loadError

  const filteredEntries = useMemo(() => {
    if (!query.trim()) return resources
    if (searchIndex) return searchResources(searchIndex, query)
    return fallbackFilterResources(resources, query)
  }, [query, resources, searchIndex])

  const kindData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of filteredEntries) {
      counts.set(entry.kind, (counts.get(entry.kind) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([kind, total]) => ({
        kind,
        label: kindMeta[kind]?.label ?? kind,
        total,
        fill: kindMeta[kind]?.color ?? '#ff8a3d',
      }))
      .sort((a, b) => b.total - a.total)
  }, [filteredEntries])

  const statusData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of filteredEntries) {
      counts.set(entry.status, (counts.get(entry.status) ?? 0) + 1)
    }
    return [...counts.entries()].map(([status, total]) => ({
      status,
      label: statusMeta[status]?.label ?? status,
      total,
      fill: statusMeta[status]?.color ?? '#6ee7ff',
    }))
  }, [filteredEntries])

  const cadenceData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of filteredEntries) {
      const key = entry.addedAt.slice(0, 7)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => ({
        month: month.replace('-', '.'),
        total,
      }))
  }, [filteredEntries])

  const stackCount = useMemo(
    () => new Set(filteredEntries.flatMap((entry) => entry.stack)).size,
    [filteredEntries],
  )
  const usingCount = statusData.find((item) => item.status === 'using')?.total ?? 0
  const markedCount = statusData.find((item) => item.status === 'marked')?.total ?? 0

  return (
    <div className="resource-shell relative min-h-screen overflow-hidden bg-[#090909] text-[#f5f1ea]">
      <div
        className="pointer-events-none absolute inset-0 opacity-90 transition duration-300"
        style={{
          background: `radial-gradient(480px circle at ${pointer.x}px ${pointer.y}px, rgba(110,231,255,0.14), transparent 52%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 pb-12 pt-6 md:px-10 lg:px-14">
        <header className="flex flex-col gap-8 border-b border-white/8 pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[760px]">
              <button
                onClick={onBack}
                className="mb-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.42em] text-white/52 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
                Return
              </button>
              <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.46em] text-white/40">
                <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(110,231,255,0.95)]" />
                Resource Archive
              </div>
              <h1 className="text-[clamp(2rem,5.5vw,5.5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-white">
                资源雷达
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
                一个可搜索的插件、开源仓库、组件和工具档案。
              </p>
            </div>

            <div className="flex w-full max-w-[440px] flex-col gap-4">
              <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] p-1">
                <button
                  onClick={onOpenJournal}
                  className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/46 transition hover:text-white"
                >
                  Journal
                </button>
                <button className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white">
                  Resources
                </button>
              </div>
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
                  <label className="journal-search-inner flex items-center gap-4 rounded-[27px] border border-white/10 bg-[#0f1618]/92 px-4 py-4 backdrop-blur-xl transition duration-500 focus-within:bg-[#101b1d]/96">
                    <Search className="h-5 w-5 text-white/44" strokeWidth={1.7} />
                    <input
                      value={query}
                      onChange={(e) => onQueryChange(e.target.value)}
                      placeholder="Search title, stack, tag, note"
                      className="w-full bg-transparent text-sm tracking-[0.08em] text-white outline-none placeholder:text-white/26"
                    />
                  </label>
                </BorderBeam>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricPanel
              icon={<Bookmark className="h-4 w-4" />}
              label="Visible Nodes"
              value={String(filteredEntries.length).padStart(2, '0')}
              tone="orange"
            />
            <MetricPanel
              icon={<Boxes className="h-4 w-4" />}
              label="Stacks Covered"
              value={String(stackCount).padStart(2, '0')}
              tone="cyan"
            />
            <MetricPanel
              label="Using Now"
              value={String(usingCount).padStart(2, '0')}
              tone="lime"
            />
            <MetricPanel
              label="Marked"
              value={String(markedCount).padStart(2, '0')}
              tone="violet"
            />
          </div>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-white/8 py-5 text-[11px] uppercase tracking-[0.38em] text-white/36">
          <span>{filteredEntries.length.toString().padStart(2, '0')} Resources Visible</span>
          <span>{isSearchLoading ? 'Indexing Search' : 'Static Link Archive'}</span>
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
                Reading local resource entries and preparing the archive index.
              </p>
            </div>
          </div>
        ) : null}

        {!isManifestLoading ? (
          <div className="grid gap-6 border-b border-white/8 py-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
            <section className="resource-panel">
              <div className="resource-panel__header">
                <span>Type Distribution</span>
                <span>{kindData.length.toString().padStart(2, '0')} Kinds</span>
              </div>
              <ChartContainer
                className="mt-6 h-[260px] w-full"
                config={Object.fromEntries(
                  kindData.map((item) => [item.kind, { label: item.label, color: item.fill }]),
                )}
              >
                <BarChart data={kindData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                    {kindData.map((item) => (
                      <Cell key={item.kind} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </section>

            <section className="resource-panel">
              <div className="resource-panel__header">
                <span>Status Mix</span>
                <span>
                  {statusData
                    .reduce((sum, item) => sum + item.total, 0)
                    .toString()
                    .padStart(2, '0')}{' '}
                  Total
                </span>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-center">
                <ChartContainer
                  className="mx-auto h-[220px] w-full max-w-[220px]"
                  config={Object.fromEntries(
                    statusData.map((item) => [
                      item.status,
                      { label: item.label, color: item.fill },
                    ]),
                  )}
                >
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="total"
                      nameKey="label"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {statusData.map((item) => (
                        <Cell key={item.status} fill={item.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3">
                  {statusData.map((item) => (
                    <div key={item.status} className="resource-status-row">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm text-white/66">{item.label}</span>
                      </div>
                      <span className="text-sm text-white/46">
                        {String(item.total).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {!isManifestLoading ? (
          <div className="grid gap-6 border-b border-white/8 py-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="resource-panel">
              <div className="resource-panel__header">
                <span>Capture Cadence</span>
                <span>{cadenceData.length.toString().padStart(2, '0')} Months</span>
              </div>
              <div className="mt-6 space-y-4">
                {cadenceData.length > 0 ? (
                  cadenceData.map((item) => {
                    const max = Math.max(...cadenceData.map((data) => data.total), 1)
                    return (
                      <div key={item.month}>
                        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/34">
                          <span>{item.month}</span>
                          <span>{String(item.total).padStart(2, '0')}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="resource-meter-fill h-full rounded-full"
                            style={{ width: `${(item.total / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm leading-7 text-white/52">
                    No entries available for timeline aggregation.
                  </p>
                )}
              </div>
            </section>

            <section className="resource-panel">
              <div className="resource-panel__header">
                <span>Recording Model</span>
                <span>JSON Source</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {['title', 'url', 'description', 'notes', 'kind', 'status', 'addedAt', 'tags'].map(
                  (field) => (
                    <div key={field} className="resource-chip">
                      {field}
                    </div>
                  ),
                )}
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/58">
                Use one record per link. Keep `description` focused on what it is, and put your own
                judgment in `notes`.
              </p>
            </section>
          </div>
        ) : null}

        <main className={`grid gap-4 py-8 ${isManifestLoading ? 'hidden' : ''}`}>
          {filteredEntries.map((entry) => (
            <article key={entry.id} className="resource-card" data-kind={entry.kind}>
              <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[88px_minmax(0,1fr)_220px] lg:items-start">
                <div className="flex items-start justify-between lg:block">
                  <span className="text-[11px] uppercase tracking-[0.42em] text-white/28">
                    {entry.indexLabel}
                  </span>
                  <span className="resource-badge mt-0 lg:mt-4" data-tone={entry.kind}>
                    {kindMeta[entry.kind]?.label ?? entry.kind}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-3 text-[clamp(1.15rem,2vw,2rem)] font-semibold leading-[0.96] tracking-[-0.035em] text-white transition hover:text-cyan-100"
                    >
                      <span>{entry.title}</span>
                      <ArrowUpRight
                        className="h-5 w-5 text-white/34 transition group-hover:text-cyan-300"
                        strokeWidth={1.7}
                      />
                    </a>
                    <span className="resource-badge" data-tone={entry.status}>
                      {statusMeta[entry.status]?.label ?? entry.status}
                    </span>
                  </div>

                  <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60 md:text-[15px]">
                    {entry.description}
                  </p>
                  {entry.notes ? (
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/42">{entry.notes}</p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="resource-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:justify-end lg:text-right">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.36em] text-white/26">
                      {formatResourceDate(entry.addedAt)}
                    </div>
                    <div className="mt-2 text-sm text-white/56">{entry.source}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {entry.stack.map((item) => (
                      <span key={item} className="resource-tag resource-tag--stack">
                        {item}
                      </span>
                    ))}
                  </div>
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
                Search by resource name, stack, tag, or the note you wrote when you bookmarked it.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function MetricPanel({
  icon,
  label,
  value,
  tone,
}: {
  icon?: ReactNode
  label: string
  value: string
  tone: 'orange' | 'cyan' | 'lime' | 'violet'
}) {
  return (
    <div className="resource-metric" data-tone={tone}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] uppercase tracking-[0.36em] text-white/34">{label}</span>
        {icon ? <span className="text-white/36">{icon}</span> : null}
      </div>
      <div className="mt-5 text-[clamp(2rem,4vw,3.2rem)] font-black leading-none tracking-[-0.05em] text-white">
        {value}
      </div>
    </div>
  )
}
