# Content Authoring

Place blog posts under `content/posts/**/*.md`.

Required frontmatter:

```md
---
title: Post title
date: 2026-04-27
summary: One-sentence list summary.
tags: [motion, ui]
category: Motion
accent: "#ff7a1a"
lang: zh-CN
---
```

Optional frontmatter:

- `updated`
- `slug`
- `cover`
- `draft`

Build output:

- `public/generated/posts-manifest.json`
- `public/generated/search-index.json`
- `public/generated/posts/<slug>.json`
