# Product Specification

## Overview

A personal publishing engine that transforms ideas into published blog posts with AI assistance.

---

## 1. Content Model

### Note

The atomic unit of content. A note can contain:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | UUID |
| `title` | string | no | Optional title (can be generated) |
| `content` | string | yes | Raw markdown content, may include URLs |
| `urls` | string[] | no | Extracted URLs from content (auto-parsed) |
| `tags` | string[] | no | User-defined tags |
| `status` | enum | yes | `idea` \| `draft` \| `ready` \| `scheduled` \| `published` \| `archived` |
| `scheduledAt` | datetime | no | When to publish (if scheduled) |
| `publishedAt` | datetime | no | When it was published |
| `createdAt` | datetime | yes | Creation timestamp |
| `updatedAt` | datetime | yes | Last modification |
| `slug` | string | no | URL slug (generated from title) |
| `heroImage` | Image | no | Hero image reference |
| `images` | Image[] | no | Inline illustrations |

### Image

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | UUID |
| `url` | string | yes | CDN URL (R2) |
| `prompt` | string | yes | Generation prompt used |
| `style` | string | no | Visual style (whiteboard, isometric, etc.) |
| `provider` | string | yes | `gemini` \| `manual` |
| `createdAt` | datetime | yes | Creation timestamp |

### Status Flow

```
idea → draft → ready → scheduled → published
                 ↓         ↓           ↓
              archived  archived    archived
```

Notes can move backward (published → draft for revision) but this creates a new draft, preserving the published version until replaced.

---

## 2. Backoffice

### Access

- Route: `/admin`
- Protection: Query parameter token (`/admin?token=<SECRET>`)
- No login UI, no sessions
- Token stored in environment variable

### Content List View

A single list showing all notes with:

- Title (or first 50 chars of content if no title)
- Status badge (color-coded)
- Tags
- Created date
- Scheduled date (if applicable)
- Quick actions: Edit, Preview, Delete, Change Status

Filtering:
- By status (dropdown)
- By tag (dropdown)
- Search (full-text on title + content)

Sorting:
- By created date (default: newest first)
- By updated date
- By scheduled date

### Note Editor

Split view:
- Left: Markdown editor with syntax highlighting
- Right: Live preview (rendered markdown)

Editor features:
- Auto-save (debounced, 2 seconds after last keystroke)
- Tag management (add/remove)
- Status dropdown
- Schedule date picker (appears when status = scheduled)
- Image section (see below)

### Image Management

Within the note editor:

**Hero Image**
- Generate button → calls AI, shows 3-5 variants in a grid
- Select one as hero
- Or: Upload manually

**Inline Images**
- Add image placeholder: `![alt](placeholder:description)`
- Generate button per placeholder → shows variants
- Select one, replaces placeholder with actual URL
- Or: Upload manually

**Image Prompt Visibility**
- Show the prompt used for each generated image
- Allow editing the prompt and regenerating
- Copy prompt button (for manual generation in external tools)

### Import Tool

Dedicated page: `/admin/import`

- Large textarea for paste
- "Clean & Import" button
- Cleaning logic:
  - Normalize headings
  - Fix broken markdown (unclosed tags, weird spacing)
  - Convert HTML entities
  - Strip platform-specific formatting (Medium embeds, Substack widgets)
  - Preserve code blocks
- Preview cleaned output before saving as new note (status: idea)

### Preview

- Button on each note: "Preview"
- Opens the note rendered exactly as it would appear on the public blog
- Uses the actual blog template/styles
- URL: `/admin/preview/[id]`

---

## 3. Writing Engine

### Input Processing

When a note is created or edited:

1. **URL Detection**: Extract all URLs from content
2. **URL Classification**:
   - HN thread → flag for HN analysis
   - Reddit thread → flag for Reddit analysis
   - Article URL → flag for content extraction
   - Other → store as reference

### AI Generation Pipeline

Triggered manually via "Generate Draft" button in editor.

**Phase 1: Analysis**
- If HN/Reddit URL: Run theme extraction (port from chrome-ext-hn)
- If article URL: Fetch and summarize
- Combine with user's notes

**Phase 2: Outline**
- Generate article structure
- 5-7 sections max
- Identify where visuals would help

**Phase 3: Draft**
- Generate full article following writing rules:
  - Conversational but authoritative
  - Short paragraphs (2-4 sentences)
  - Bold key phrases
  - Concrete section titles
  - `[VISUAL: description]` placeholders for images

**Phase 4: Review**
- Run persona-based review (Senior Engineer persona)
- Generate scores: Clarity, Depth, Engagement, Practical Value
- Apply suggested improvements automatically

**Phase 5: Finalize**
- Generate title options (pick best)
- Generate subtitle
- Generate tags
- Replace `[VISUAL: ...]` placeholders with image generation prompts

Output: Updated note content + image prompts ready for generation.

### Writing Rules (Embedded in Prompts)

**Do:**
- Conversational but authoritative tone
- Short paragraphs (2-4 sentences)
- Liberal subheadings
- Concrete, descriptive section titles
- Bold key phrases for skimmers
- Reference real companies/projects
- Include external data/metrics

**Don't:**
- Marketing speak, buzzwords
- Em dashes (use commas, colons, parentheses)
- Clickbait titles
- "Ultimate Guide to..." or "X is Dead" clichés
- Overly long intros

---

## 4. Image Engine

### Generation

Provider: Google Gemini API with model `imagen-3.0-generate-002` (or latest available)

Note: "Nano Banana Pro" may be a working name. Implementation will use the standard Gemini Imagen API.

**Hero Image Generation**
- Input: Article title + summary
- Output: 4 variants
- Styles: Auto-select 2-3 appropriate styles from:
  - Whiteboard Sketch
  - Isometric Technical
  - Infographic
  - Conceptual Abstract
  - Blueprint
  - Minimalist Icons
  - Retro Diagram
  - Dark Mode UI

**Inline Image Generation**
- Input: `[VISUAL: description]` placeholder text
- Output: 3 variants per placeholder
- Style: Infer from description or use article's dominant style

### Storage

- Upload to Cloudflare R2
- Path: `images/[year]/[month]/[note-id]/[image-id].[ext]`
- Store prompt and metadata alongside

### Manual Upload Fallback

- Drag-and-drop or file picker
- Uploads to same R2 path structure
- Provider marked as `manual`

### Prompt Visibility

All prompts are:
- Stored with the image
- Visible in the UI
- Editable (regenerate with modified prompt)
- Copyable (for use in external tools like Midjourney)

---

## 5. Blog Frontend

### Technology

- Next.js 14+ (App Router)
- Static generation (SSG) from markdown files
- Deployed on Vercel

### Content Source

- Reads directly from markdown files in `/content/posts/`
- Each published note becomes: `/content/posts/[year]/[month]/[slug].md`
- Frontmatter contains metadata (title, date, tags, images)

### URL Structure

```
/                           → Homepage
/[year]/[month]/[slug]      → Article page
/tags                       → All tags
/tags/[tag]                 → Articles by tag
/search                     → Search page
```

### Homepage

- Hero section: Latest published article (featured)
- Below: Grid/list of recent articles (paginated, 10 per page)
- Sidebar or footer: Tag cloud

### Article Page

- Hero image (full width)
- Title + subtitle
- Published date + reading time
- Content with inline images
- Tags at bottom
- Previous/Next navigation

### Tag Pages

- Tag name as heading
- List of articles with that tag
- Sorted by publish date

### Search

- Client-side search using pre-built index
- Search title + content
- Instant results as you type

### Design

- Minimalist, clean typography
- Light theme (no dark mode for v1)
- Mobile responsive
- Fast: target < 1s LCP

### SEO

- Meta tags (title, description, og:image)
- Structured data (Article schema)
- Sitemap.xml
- robots.txt
- Canonical URLs

---

## 6. Automation Layer

### Background Jobs

Runs via configurable cron (default: 2:00 AM local time).

**Job 1: Source Monitor**

Monitors:
- Hacker News front page
- Specific subreddits: r/programming, r/MachineLearning, r/LocalLLaMA, r/ExperiencedDevs
- Topics: AI, LLMs, distributed systems, data engineering, Kafka, Flink, developer tools

Logic:
1. Fetch recent top posts from sources
2. Score relevance against topic keywords
3. For posts above threshold:
   - Create new note with URL and brief summary
   - Status: `idea`
   - Tag: `auto-sourced`

**Job 2: Idea Expander**

For notes tagged `expand-me`:
1. Run through Phase 1-2 of writing pipeline (analysis + outline)
2. Save as draft
3. Remove `expand-me` tag, add `auto-expanded`

**Job 3: Scheduled Publisher**

For notes with status `scheduled` and `scheduledAt <= now`:
1. Generate markdown file in `/content/posts/`
2. Update note status to `published`
3. Trigger Vercel rebuild (deploy hook)

### Configuration

Stored in `/config/automation.json`:

```json
{
  "enabled": true,
  "schedule": "0 2 * * *",
  "sources": {
    "hn": { "enabled": true, "minScore": 100 },
    "reddit": {
      "enabled": true,
      "subreddits": ["programming", "MachineLearning", "LocalLLaMA", "ExperiencedDevs"]
    }
  },
  "topics": ["AI", "LLM", "distributed systems", "Kafka", "Flink", "data engineering"],
  "relevanceThreshold": 0.7
}
```

Editable via backoffice: `/admin/settings`

---

## 7. Publishing Flow

### Manual Publish

1. Note is in `ready` status
2. Click "Publish" in backoffice
3. System:
   - Generates slug from title (if not set)
   - Creates `/content/posts/[year]/[month]/[slug].md`
   - Writes frontmatter + content
   - Updates note status to `published`
   - Triggers Vercel deploy hook
4. Blog rebuilds, article is live

### Scheduled Publish

1. Note is in `ready` status
2. Set scheduled date/time
3. Change status to `scheduled`
4. Background job publishes when time arrives

### Unpublish

1. Note is in `published` status
2. Click "Unpublish"
3. System:
   - Deletes markdown file from `/content/posts/`
   - Updates note status to `archived`
   - Triggers Vercel deploy hook

---

## 8. Data Storage

### Notes & Metadata

Option A: **File-based (Git)**
- Notes stored as markdown in `/content/notes/[id].md`
- Frontmatter contains all metadata
- Git provides history
- No database needed

Option B: **Database (Neon)**
- Notes table with all fields
- Faster queries, better filtering
- Required if we need:
  - Full-text search beyond simple grep
  - Complex status transitions
  - Background job state
  - Image metadata separate from notes

**Recommendation**: Start with Neon. The backoffice needs fast filtering/sorting, and scheduled jobs need persistent state. Git remains the source of truth for published content only.

### Images

- Cloudflare R2 for storage
- Metadata (prompt, style, provider) stored with note in database

### Configuration

- `/config/` directory in repo
- JSON files for automation settings
- Environment variables for secrets

---

## 9. Security

### Backoffice Access

- Single token in query parameter
- Token: 64+ character random string
- Stored in `ADMIN_TOKEN` env var
- Middleware checks token on all `/admin/*` routes
- No token = 404 (not 401, to avoid revealing the route exists)

### API Routes

- All `/api/admin/*` routes require the same token
- Token passed via `Authorization: Bearer <token>` header

### Content Security

- Markdown sanitized before rendering (no raw HTML injection)
- Image URLs validated (only from R2 domain)

---

## 10. File Structure

```
my-blogs/
├── app/                      # Next.js app router
│   ├── (blog)/              # Public blog routes
│   │   ├── page.tsx         # Homepage
│   │   ├── [year]/[month]/[slug]/page.tsx
│   │   ├── tags/
│   │   └── search/
│   ├── admin/               # Backoffice routes
│   │   ├── page.tsx         # Content list
│   │   ├── notes/[id]/      # Note editor
│   │   ├── import/          # Import tool
│   │   ├── preview/[id]/    # Preview
│   │   └── settings/        # Automation config
│   └── api/                 # API routes
│       ├── admin/           # Protected admin APIs
│       │   ├── notes/
│       │   ├── images/
│       │   ├── generate/
│       │   └── publish/
│       └── webhook/         # Deploy hooks
├── content/
│   └── posts/               # Published markdown (git-versioned)
│       └── [year]/[month]/[slug].md
├── config/
│   └── automation.json
├── lib/                     # Shared utilities
│   ├── ai/                  # Anthropic + Gemini clients
│   ├── db/                  # Database client
│   ├── storage/             # R2 client
│   └── markdown/            # Parsing + rendering
├── components/              # React components
├── styles/                  # Design system
├── docs/                    # This documentation
└── scripts/                 # CLI tools, migrations
```
