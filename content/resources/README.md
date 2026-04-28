# Resource Authoring

Place collected links in `content/resources/entries.json`.

Each item should follow this structure:

```json
{
  "id": "unique-slug",
  "title": "Resource name",
  "url": "https://example.com",
  "description": "One-line summary for the list view.",
  "notes": "Why it is useful, when to use it, or what to revisit later.",
  "kind": "plugin",
  "status": "marked",
  "addedAt": "2026-04-28",
  "source": "github",
  "tags": ["react", "ui"],
  "stack": ["React", "Tailwind CSS"]
}
```

Recommended conventions:

- `kind`: `plugin` | `component` | `open-source` | `tool` | `library`
- `status`: `using` | `marked` | `watching`
- `addedAt`: `YYYY-MM-DD`
- `description`: what it is
- `notes`: why it matters for your workflow

Build output:

- `public/generated/resources-manifest.json`
- `public/generated/resources-search-index.json`
