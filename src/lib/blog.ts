export type PostSummary = {
  slug: string
  title: string
  date: string
  updated: string | null
  summary: string
  tags: string[]
  cover: string | null
  category: string
  accent: string
  lang: string
  readingTime: number
  path: string
  headings: Array<{ depth: number; text: string; id: string }>
  indexLabel: string
}

export type PostsManifest = {
  generatedAt: string
  total: number
  posts: PostSummary[]
}

export type SearchIndex = {
  version: number
  generatedAt: string
  documents: Array<
    Pick<
      PostSummary,
      'slug' | 'title' | 'summary' | 'date' | 'updated' | 'category' | 'accent' | 'tags' | 'lang' | 'readingTime' | 'indexLabel'
    >
  >
  postings: Record<string, Array<[string, number]>>
}

const generatedPath = (fileName: string) => `${import.meta.env.BASE_URL}generated/${fileName}`

export async function loadPostsManifest() {
  return fetchJson<PostsManifest>(generatedPath('posts-manifest.json'))
}

export async function loadSearchIndex() {
  return fetchJson<SearchIndex>(generatedPath('search-index.json'))
}

export function searchPosts(index: SearchIndex, query: string) {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return index.documents

  const scored = new Map<string, number>()

  for (const token of tokens) {
    const postings = index.postings[token]
    if (!postings) continue

    for (const [slug, score] of postings) {
      scored.set(slug, (scored.get(slug) ?? 0) + score)
    }
  }

  return index.documents
    .filter((document) => scored.has(document.slug))
    .sort((a, b) => {
      const scoreDiff = (scored.get(b.slug) ?? 0) - (scored.get(a.slug) ?? 0)
      if (scoreDiff !== 0) return scoreDiff
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

export function fallbackFilter(posts: PostSummary[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return posts

  return posts.filter((post) =>
    [post.title, post.summary, post.category, ...post.tags].some((item) =>
      item.toLowerCase().includes(normalized),
    ),
  )
}

export function formatPostDate(date: string) {
  return date.replace(/-/g, '.')
}

export function formatReadTime(minutes: number) {
  return `${String(minutes).padStart(2, '0')} min`
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
