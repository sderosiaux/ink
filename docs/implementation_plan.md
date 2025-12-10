# Implementation Plan

## Overview

This plan follows TDD principles: write tests first, then implement. We build in vertical slices — each milestone delivers a working feature end-to-end.

---

## Milestone 0: Project Setup

**Goal**: Scaffold the project with all tooling configured.

### Tasks

1. **Initialize Next.js project**
   - `pnpm create next-app` with App Router, TypeScript, Tailwind
   - Configure path aliases (`@/`)

2. **Set up database**
   - Create Neon project
   - Install Drizzle ORM + drizzle-kit
   - Define schema (notes, images, job_runs tables)
   - Run initial migration

3. **Set up R2**
   - Create Cloudflare R2 bucket
   - Configure S3 client with R2 endpoint
   - Create upload/delete utilities

4. **Set up testing**
   - Install Vitest, Playwright
   - Configure test database
   - Add test scripts to package.json

5. **Set up design system**
   - Configure Tailwind theme (colors, spacing, typography)
   - Create base component styles

6. **Environment configuration**
   - Create `.env.example`
   - Document all required variables

### Deliverable

- Empty Next.js app that builds
- Database migrations run
- R2 client connects
- `pnpm test` runs (with placeholder test)

---

## Milestone 1: Core Data Layer

**Goal**: CRUD operations for notes with full test coverage.

### Tests First

Write tests for:
- `createNote()` — creates note with defaults
- `updateNote()` — updates fields, refreshes updatedAt
- `deleteNote()` — removes note and associated images
- `getNote()` — retrieves by ID
- `listNotes()` — filters by status, tags, search
- URL extraction from content
- Slug generation

### Implementation

1. **Note service** (`lib/notes/service.ts`)
   - All CRUD operations
   - URL extraction helper
   - Slug generation helper

2. **Database queries** (`lib/db/queries/notes.ts`)
   - Drizzle queries for each operation

3. **Validation** (`lib/notes/validation.ts`)
   - Zod schemas for note input/output
   - Status transition validation

### Deliverable

- All note CRUD operations working
- Tests passing
- No UI yet

---

## Milestone 2: Backoffice Shell

**Goal**: Protected admin routes with basic navigation.

### Tests First

Write tests for:
- Token validation middleware
- 404 on invalid/missing token
- Token preservation across navigation

### Implementation

1. **Middleware** (`middleware.ts`)
   - Token check for `/admin/*` routes
   - Token check for `/api/admin/*` routes
   - Return 404 (not 401) on failure

2. **Admin layout** (`app/admin/layout.tsx`)
   - Navigation header
   - Token in all internal links

3. **Admin pages** (stubs)
   - `/admin` — content list (stub)
   - `/admin/notes/[id]` — editor (stub)
   - `/admin/import` — import tool (stub)
   - `/admin/settings` — settings (stub)

### Deliverable

- Can access `/admin?token=xxx`
- Cannot access without token
- Navigation between admin pages works

---

## Milestone 3: Content List

**Goal**: View and manage notes in a list.

### Tests First

Write E2E tests for:
- List shows all notes
- Filter by status works
- Filter by tag works
- Search works
- Status change from list

### Implementation

1. **API routes**
   - `GET /api/admin/notes` — list with filters
   - `PATCH /api/admin/notes/[id]` — update (status only for now)
   - `DELETE /api/admin/notes/[id]` — delete

2. **Content list UI** (`app/admin/page.tsx`)
   - Table with notes
   - Status badges (color-coded)
   - Filter dropdowns (status, tags)
   - Search input
   - Delete button with confirmation

3. **New note button**
   - Creates blank note
   - Redirects to editor

### Deliverable

- View all notes in a list
- Filter and search
- Change status
- Delete notes

---

## Milestone 4: Note Editor

**Goal**: Create and edit notes with live preview.

### Tests First

Write tests for:
- Auto-save (debounced)
- Tag management
- Markdown preview renders correctly
- Status change from editor

### Implementation

1. **Editor page** (`app/admin/notes/[id]/page.tsx`)
   - Split view: editor left, preview right
   - CodeMirror for markdown editing
   - Live preview (rendered markdown)

2. **Editor features**
   - Auto-save (2s debounce)
   - Tag input (add/remove)
   - Status dropdown
   - Schedule date picker (visible when status=scheduled)

3. **API routes**
   - `GET /api/admin/notes/[id]`
   - `PATCH /api/admin/notes/[id]` — full update

### Deliverable

- Edit notes with live preview
- Auto-save working
- Tags and status editable

---

## Milestone 5: Import Tool

**Goal**: Paste and clean content from other platforms.

### Tests First

Write unit tests for:
- Medium embed removal
- HTML entity conversion
- Heading normalization
- Code block preservation

### Implementation

1. **Cleaning library** (`lib/markdown/cleaner.ts`)
   - All cleaning transformations

2. **Import page** (`app/admin/import/page.tsx`)
   - Large textarea
   - "Clean" button
   - Preview of cleaned output
   - "Save as note" button

### Deliverable

- Paste messy markdown, get clean version
- Save cleaned content as new note

---

## Milestone 6: Image Management

**Goal**: Upload, generate, and manage images.

### Tests First

Write tests for:
- R2 upload
- R2 delete
- Image metadata stored in DB
- Image prompts saved

### Implementation

1. **Image service** (`lib/images/service.ts`)
   - `uploadImage()` — to R2
   - `deleteImage()` — from R2
   - `saveImageMetadata()` — to DB

2. **Gemini client** (`lib/ai/gemini.ts`)
   - `generateImages(prompt, count)` — returns image buffers
   - Handle API errors gracefully

3. **API routes**
   - `POST /api/admin/images/upload` — manual upload
   - `POST /api/admin/images/generate` — AI generation

4. **Image UI in editor**
   - Hero image section
   - Generate button → shows variants
   - Select variant → saves as hero
   - Manual upload alternative
   - Inline image management (for placeholders)

### Deliverable

- Generate hero images (4 variants)
- Select or upload manually
- Images stored in R2

---

## Milestone 7: AI Writing Engine

**Goal**: Generate drafts using Claude.

### Tests First

Write tests for:
- Draft generation from plain text
- HN thread analysis integration
- Writing rules applied
- Error handling (timeout, rate limit)

### Implementation

1. **Anthropic client** (`lib/ai/anthropic.ts`)
   - `generateDraft()` — streaming response
   - Prompt templates with writing rules

2. **HN analysis** (port from chrome extension)
   - `fetchHNThread()` — via Algolia API
   - `analyzeThread()` — theme extraction
   - `buildContext()` — prepare for draft generation

3. **API route**
   - `POST /api/admin/generate/[id]` — SSE stream

4. **UI integration**
   - "Generate Draft" button in editor
   - Streaming content update
   - Loading state

### Deliverable

- Click "Generate" → get AI draft
- HN URLs are analyzed first
- Content streams into editor

---

## Milestone 8: Blog Frontend

**Goal**: Public blog that renders published posts.

### Tests First

Write E2E tests for:
- Homepage shows posts
- Article page renders correctly
- Tag pages work
- Search works
- SEO meta tags present

### Implementation

1. **Content reading** (`lib/content/reader.ts`)
   - Read markdown from `/content/posts/`
   - Parse frontmatter
   - Generate reading time

2. **Blog pages**
   - `/` — homepage with featured + recent
   - `/[year]/[month]/[slug]` — article page
   - `/tags` — all tags
   - `/tags/[tag]` — posts by tag
   - `/search` — search page

3. **Components**
   - Article card
   - Article full view
   - Tag badge
   - Search input

4. **SEO**
   - Meta tags (title, description, og:image)
   - sitemap.xml generation
   - robots.txt

### Deliverable

- Public blog is live
- Posts render correctly
- SEO basics in place

---

## Milestone 9: Publishing Flow

**Goal**: Publish notes to the blog.

### Tests First

Write tests for:
- Markdown file created on publish
- Frontmatter correct
- Status updated
- Deploy hook triggered
- Unpublish removes file

### Implementation

1. **Publish service** (`lib/publish/service.ts`)
   - `publishNote()` — write file, update status, trigger hook
   - `unpublishNote()` — delete file, archive, trigger hook

2. **Frontmatter generation** (`lib/content/frontmatter.ts`)
   - Generate YAML from note metadata

3. **API routes**
   - `POST /api/admin/publish/[id]`
   - `POST /api/admin/unpublish/[id]`

4. **UI integration**
   - "Publish" button (when status=ready)
   - "Unpublish" button (when status=published)
   - "View on blog" link

5. **Vercel integration**
   - Deploy hook on publish/unpublish

### Deliverable

- Publish from backoffice → live on blog
- Unpublish removes from blog

---

## Milestone 10: Preview

**Goal**: Preview notes before publishing.

### Implementation

1. **Preview page** (`app/admin/preview/[id]/page.tsx`)
   - Renders note using blog template
   - Same styles as public blog
   - Banner indicating "Preview mode"

2. **Link from editor**
   - "Preview" button opens preview page

### Deliverable

- Preview any note as it would appear on blog

---

## Milestone 11: Automation - Scheduled Publishing

**Goal**: Publish notes at scheduled time.

### Tests First

Write tests for:
- Cron job finds scheduled notes
- Publishes when time arrived
- Doesn't publish future notes
- Job state recorded

### Implementation

1. **Cron route** (`app/api/cron/publish/route.ts`)
   - Query notes where status=scheduled AND scheduledAt <= now
   - Publish each one
   - Log results to job_runs table

2. **Vercel cron config**
   - Add to vercel.json (every 15 min)

### Deliverable

- Set schedule → note publishes automatically

---

## Milestone 12: Automation - Source Monitor

**Goal**: Auto-create ideas from HN/Reddit.

### Tests First

Write tests for:
- HN fetch and scoring
- Reddit fetch and scoring
- Note creation from sources
- Relevance threshold respected

### Implementation

1. **Source clients**
   - `lib/sources/hn.ts` — fetch top stories
   - `lib/sources/reddit.ts` — fetch from subreddits

2. **Relevance scoring** (`lib/sources/relevance.ts`)
   - Score against topic keywords
   - Configurable threshold

3. **Cron route** (`app/api/cron/monitor/route.ts`)
   - Fetch sources
   - Score relevance
   - Create notes for matches

4. **Settings UI**
   - Configure subreddits
   - Configure topics
   - Enable/disable

### Deliverable

- Wake up to new ideas from overnight monitoring

---

## Milestone 13: Polish & Launch

**Goal**: Final touches and deployment.

### Tasks

1. **Error handling**
   - User-friendly error messages
   - Graceful degradation

2. **Loading states**
   - Skeletons where appropriate

3. **Mobile responsiveness**
   - Test and fix backoffice on tablet

4. **Performance**
   - Measure and optimize LCP
   - Lazy load images

5. **Documentation**
   - README with setup instructions
   - Environment variables documented

6. **Production deployment**
   - Set up Vercel project
   - Configure environment variables
   - Deploy

### Deliverable

- Production-ready publishing engine

---

## Risks & Spikes

### Spike 1: Gemini Imagen API Availability

**Risk**: "Gemini Nano Banana Pro" model may not be available or may have different API.

**Mitigation**:
- Early spike to test actual Gemini API
- Fallback: prompts are visible for manual generation
- Alternative: DALL-E 3 as backup provider

### Spike 2: Vercel Cron Limits

**Risk**: Hobby plan has 10-second limit for cron jobs.

**Mitigation**:
- Keep jobs small and fast
- For source monitoring: limit to top 10 items per source
- Consider upgrade if needed

### Spike 3: Git Operations from Serverless

**Risk**: Writing files and git commits from Vercel functions may be complex.

**Mitigation**:
- Alternative 1: GitHub API to create/update files
- Alternative 2: Vercel blob storage for content (instead of git)
- Alternative 3: External service for git operations

**Recommendation**: Use GitHub API to create/update files in the repo. This avoids git CLI complexity and works well with Vercel's deployment model.

---

## Dependency Order

```
M0 (Setup)
    │
    ▼
M1 (Data Layer)
    │
    ├──────────────────┐
    ▼                  ▼
M2 (Auth Shell)    M6 (Images)
    │                  │
    ▼                  │
M3 (List)              │
    │                  │
    ▼                  │
M4 (Editor) ◄──────────┘
    │
    ├──────────────┐
    ▼              ▼
M5 (Import)    M7 (AI Engine)
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
M8 (Blog Frontend)          M11 (Scheduled Publish)
    │                             │
    ▼                             ▼
M9 (Publishing) ◄─────────────────┘
    │
    ▼
M10 (Preview)
    │
    ▼
M12 (Source Monitor)
    │
    ▼
M13 (Polish)
```

---

## MVP Definition

**Minimum to launch** (can defer automation):

- M0-M5: Setup, data, backoffice shell, list, editor, import
- M6-M7: Images, AI generation
- M8-M9: Blog frontend, publishing
- M10: Preview

**Defer to v1.1**:
- M11: Scheduled publishing
- M12: Source monitoring

This gives a working publishing engine without automation complexity.
