export type ResourceEntry = {
  id: string
  title: string
  url: string
  description: string
  notes: string
  kind: string
  status: string
  addedAt: string
  source: string
  tags: string[]
  stack: string[]
  indexLabel: string
}

export type ResourcesManifest = {
  generatedAt: string
  total: number
  resources: ResourceEntry[]
}

export type ResourceSearchIndex = {
  version: number
  generatedAt: string
  documents: ResourceEntry[]
  postings: Record<string, Array<[string, number]>>
}

const generatedPath = (fileName: string) => `${import.meta.env.BASE_URL}generated/${fileName}`

export async function loadResourcesManifest() {
  return fetchJson<ResourcesManifest>(generatedPath('resources-manifest.json'))
}

export async function loadResourcesSearchIndex() {
  return fetchJson<ResourceSearchIndex>(generatedPath('resources-search-index.json'))
}

export function searchResources(index: ResourceSearchIndex, query: string) {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return index.documents

  const scored = new Map<string, number>()

  for (const token of tokens) {
    const postings = index.postings[token]
    if (!postings) continue

    for (const [id, score] of postings) {
      scored.set(id, (scored.get(id) ?? 0) + score)
    }
  }

  return index.documents
    .filter((document) => scored.has(document.id))
    .sort((a, b) => {
      const scoreDiff = (scored.get(b.id) ?? 0) - (scored.get(a.id) ?? 0)
      if (scoreDiff !== 0) return scoreDiff
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    })
}

export function fallbackFilterResources(resources: ResourceEntry[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return resources

  return resources.filter((resource) =>
    [
      resource.title,
      resource.description,
      resource.notes,
      resource.kind,
      resource.status,
      resource.source,
      ...resource.tags,
      ...resource.stack,
    ].some((item) => item.toLowerCase().includes(normalized)),
  )
}

export function formatResourceDate(date: string) {
  return date.replace(/-/g, '.')
}

function tokenizeQuery(input: string) {
  const text = input.normalize('NFKC').toLowerCase()
  const tokens = new Set<string>()
  const segments = text.match(/[\p{Script=Han}]+|[a-z0-9]+/gu) ?? []

  for (const segment of segments) {
    if (/^\p{Script=Han}+$/u.test(segment)) {
      const chars = [...segment]
      if (chars.length === 1) {
        tokens.add(chars[0])
        continue
      }
      for (let i = 0; i < chars.length - 1; i += 1) {
        tokens.add(chars.slice(i, i + 2).join(''))
      }
      tokens.add(chars.join(''))
      continue
    }

    tokens.add(segment)
    if (segment.length >= 4) {
      for (let size = 3; size <= Math.min(segment.length, 10); size += 1) {
        tokens.add(segment.slice(0, size))
      }
    }
  }

  return [...tokens]
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`)
  }
  return (await response.json()) as T
}
