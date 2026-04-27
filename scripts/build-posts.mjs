import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'

const rootDir = process.cwd()
const contentDir = path.join(rootDir, 'content', 'posts')
const outputDir = path.join(rootDir, 'public', 'generated')
const postsOutputDir = path.join(outputDir, 'posts')

const ACCENTS = ['#ff7a1a', '#6ee7ff', '#f95d9b', '#c7ff4d', '#ffb84d', '#9b8cff']

marked.setOptions({
  gfm: true,
  breaks: false,
})

async function main() {
  const markdownFiles = await collectMarkdownFiles(contentDir)
  const posts = []
  const searchPostings = new Map()

  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(postsOutputDir, { recursive: true })

  for (const filePath of markdownFiles) {
    const raw = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(raw)
    const relativePath = path.relative(contentDir, filePath)
    const baseSlug = relativePath.replace(/\\/g, '/').replace(/\.md$/i, '')
    const slug = String(data.slug || baseSlug)

    if (data.draft === true) continue
    if (!data.title || !data.date || !data.summary) {
      throw new Error(`Missing required frontmatter in ${relativePath}. Required: title, date, summary`)
    }

    const category = String(data.category || 'Notes')
    const accent = String(data.accent || ACCENTS[posts.length % ACCENTS.length])
    const tags = Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : []
    const plainText = markdownToPlainText(content)
    const headings = extractHeadings(content)
    const html = await marked.parse(content)
    const readingTime = calculateReadingTimeMinutes(plainText)
    const articleOutputPath = path.join(postsOutputDir, `${slug}.json`)

    await fs.mkdir(path.dirname(articleOutputPath), { recursive: true })

    const post = {
      slug,
      title: String(data.title),
      date: normalizeDateValue(data.date),
      updated: data.updated ? normalizeDateValue(data.updated) : null,
      summary: String(data.summary),
      tags,
      cover: data.cover ? String(data.cover) : null,
      category,
      accent,
      lang: String(data.lang || 'zh-CN'),
      readingTime,
      path: `${slug}.json`,
      headings,
    }

    posts.push({
      ...post,
      plainText,
      html,
    })

    const titleTokens = tokenize(String(data.title), { includeSingleHan: true, includePrefixes: true })
    const categoryTokens = tokenize(category, { includeSingleHan: true, includePrefixes: true })
    const summaryTokens = tokenize(String(data.summary), { includeSingleHan: true, includePrefixes: true })
    const tagTokens = tokenize(tags.join(' '), { includeSingleHan: true, includePrefixes: true })
    const bodyTokens = tokenize(plainText, { includeSingleHan: false, includePrefixes: false })

    addWeightedTokens(searchPostings, titleTokens, slug, 10)
    addWeightedTokens(searchPostings, categoryTokens, slug, 6)
    addWeightedTokens(searchPostings, summaryTokens, slug, 5)
    addWeightedTokens(searchPostings, tagTokens, slug, 8)
    addWeightedTokens(searchPostings, bodyTokens, slug, 2)
  }

  posts.sort((a, b) => compareDates(b.date, a.date))

  const manifestPosts = posts.map(({ plainText: _plainText, html: _html, ...post }, index) => ({
    ...post,
    indexLabel: String(index + 1).padStart(2, '0'),
  }))
  const manifestBySlug = new Map(manifestPosts.map((post) => [post.slug, post]))

  for (const post of posts) {
    const manifestData = manifestBySlug.get(post.slug)
    await writeJson(path.join(postsOutputDir, `${post.slug}.json`), {
      ...manifestData,
      html: post.html,
      plainText: post.plainText,
    })
  }

  const searchDocuments = manifestPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    date: post.date,
    updated: post.updated,
    category: post.category,
    accent: post.accent,
    tags: post.tags,
    readingTime: post.readingTime,
    lang: post.lang,
    indexLabel: post.indexLabel,
  }))

  const searchIndex = {
    version: 1,
    generatedAt: new Date().toISOString(),
    documents: searchDocuments,
    postings: Object.fromEntries(
      [...searchPostings.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([token, matches]) => [
          token,
          [...matches.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([slug, score]) => [slug, score]),
        ]),
    ),
  }

  await writeJson(path.join(outputDir, 'posts-manifest.json'), {
    generatedAt: new Date().toISOString(),
    total: manifestPosts.length,
    posts: manifestPosts,
  })

  await writeJson(path.join(outputDir, 'search-index.json'), searchIndex)
  await fs.writeFile(path.join(outputDir, '.nojekyll'), '')

  console.log(`Built ${manifestPosts.length} posts into ${path.relative(rootDir, outputDir)}`)
}

async function collectMarkdownFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(dir, entry.name)
        if (entry.isDirectory()) return collectMarkdownFiles(entryPath)
        return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : []
      }),
    )
    return files.flat().sort((a, b) => a.localeCompare(b))
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true })
      return []
    }
    throw error
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function markdownToPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\(([^)]*)\)/g, ' ')
    .replace(/^>\s?/gm, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractHeadings(markdown) {
  return markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^##?\s+/.test(line))
    .map((line) => {
      const depth = line.startsWith('### ') ? 3 : line.startsWith('## ') ? 2 : 1
      const text = line.replace(/^#+\s+/, '').trim()
      return {
        depth,
        text,
        id: slugify(text),
      }
    })
}

function calculateReadingTimeMinutes(text) {
  const latinWords = text.match(/[a-zA-Z0-9]+/g)?.length ?? 0
  const hanChars = text.match(/\p{Script=Han}/gu)?.length ?? 0
  const minuteEstimate = Math.max(latinWords / 220, hanChars / 320, text.length / 900)
  return Math.max(1, Math.round(minuteEstimate))
}

function normalizeDateValue(value) {
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return String(value)
}

function tokenize(input, options = {}) {
  const text = input.normalize('NFKC').toLowerCase()
  const tokens = new Set()
  const segments = text.match(/[\p{Script=Han}]+|[a-z0-9]+/gu) ?? []

  for (const segment of segments) {
    if (/^\p{Script=Han}+$/u.test(segment)) {
      const chars = [...segment]
      if (options.includeSingleHan) {
        for (const char of chars) tokens.add(char)
      }
      if (chars.length === 1) {
        tokens.add(chars[0])
        continue
      }
      for (let i = 0; i < chars.length - 1; i += 1) {
        tokens.add(chars.slice(i, i + 2).join(''))
      }
      if (chars.length <= 8) tokens.add(chars.join(''))
      continue
    }

    tokens.add(segment)
    if (options.includePrefixes && segment.length >= 4) {
      for (let size = 3; size <= Math.min(segment.length, 10); size += 1) {
        tokens.add(segment.slice(0, size))
      }
    }
  }

  return tokens
}

function addWeightedTokens(index, tokens, slug, weight) {
  for (const token of tokens) {
    if (!index.has(token)) {
      index.set(token, new Map())
    }
    const matches = index.get(token)
    matches.set(slug, (matches.get(slug) ?? 0) + weight)
  }
}

function compareDates(a, b) {
  return new Date(a).getTime() - new Date(b).getTime()
}

function slugify(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
