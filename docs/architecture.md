# Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Blog (SSG)    │  │   Backoffice    │  │   API Routes    │  │
│  │   Next.js       │  │   Next.js       │  │   Next.js       │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │            │
│           │         ┌──────────┴──────────┐        │            │
│           │         │                     │        │            │
│  ┌────────▼─────────▼─────────────────────▼────────▼─────────┐  │
│  │                    Shared Libraries                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │  │
│  │  │ AI Lib  │ │ DB Lib  │ │ Storage │ │ Markdown Parser │  │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └─────────────────┘  │  │
│  └───────┼───────────┼───────────┼───────────────────────────┘  │
│          │           │           │                               │
└──────────┼───────────┼───────────┼───────────────────────────────┘
           │           │           │
           ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Anthropic│ │   Neon   │ │ Cloudflare│
    │  Claude  │ │ Postgres │ │    R2    │
    └──────────┘ └──────────┘ └──────────┘
           │
           ▼
    ┌──────────┐
    │  Gemini  │
    │  Imagen  │
    └──────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14+ (App Router) | Full-stack React |
| Language | TypeScript | Type safety |
| Database | Neon (Postgres) | Notes, metadata, job state |
| ORM | Drizzle | Type-safe queries |
| Storage | Cloudflare R2 | Image hosting |
| Text AI | Anthropic Claude | Content generation |
| Image AI | Google Gemini Imagen | Image generation |
| Hosting | Vercel | Frontend + API |
| Cron | Vercel Cron | Background jobs |
| Styling | Tailwind CSS | Utility-first CSS |
| Editor | CodeMirror 6 | Markdown editing |

## Data Flow

### 1. Note Creation

```
User                 Backoffice              API                  Database
  │                      │                    │                      │
  │──── Create Note ────►│                    │                      │
  │                      │─── POST /api/admin/notes ───────────────►│
  │                      │                    │                      │
  │                      │◄── { id, ... } ────────────────────────── │
  │◄──── Redirect ───────│                    │                      │
```

### 2. AI Generation

```
User                 Backoffice              API               Anthropic
  │                      │                    │                    │
  │── Click Generate ───►│                    │                    │
  │                      │─ POST /api/admin/generate ─►│           │
  │                      │                    │── Stream ─────────►│
  │                      │                    │◄─ Chunks ──────────│
  │◄─── SSE Updates ─────│◄── Stream ────────│                    │
  │                      │                    │                    │
  │                      │─ PATCH /api/admin/notes/[id] ──────────►│ (save)
```

### 3. Image Generation

```
User                 Backoffice              API                Gemini         R2
  │                      │                    │                    │            │
  │── Generate Image ───►│                    │                    │            │
  │                      │─ POST /api/admin/images/generate ──────►│            │
  │                      │                    │◄── image bytes ────│            │
  │                      │                    │─────── upload ─────────────────►│
  │                      │                    │◄────── url ────────────────────│
  │◄─── Show Variants ───│◄── { variants } ──│                    │            │
```

### 4. Publishing

```
User                 Backoffice              API                  Git           Vercel
  │                      │                    │                    │              │
  │──── Publish ────────►│                    │                    │              │
  │                      │─ POST /api/admin/publish/[id] ────────►│              │
  │                      │                    │── write .md ──────►│              │
  │                      │                    │── git commit ─────►│              │
  │                      │                    │── deploy hook ─────────────────►│
  │                      │                    │                    │◄── rebuild ──│
  │◄──── Success ────────│◄── { published } ─│                    │              │
```

## Database Schema

```sql
-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'idea',
  slug TEXT,
  hero_image_id UUID REFERENCES images(id),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT,
  provider TEXT NOT NULL,
  is_hero BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job runs table (for cron state)
CREATE TABLE job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  result JSONB,
  error TEXT
);

-- Indexes
CREATE INDEX idx_notes_status ON notes(status);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_scheduled ON notes(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_images_note ON images(note_id);
```

## API Routes

### Admin Routes (Protected)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/notes` | List notes (with filters) |
| POST | `/api/admin/notes` | Create note |
| GET | `/api/admin/notes/[id]` | Get note |
| PATCH | `/api/admin/notes/[id]` | Update note |
| DELETE | `/api/admin/notes/[id]` | Delete note |
| POST | `/api/admin/generate/[id]` | Generate AI draft |
| POST | `/api/admin/images/generate` | Generate images |
| POST | `/api/admin/images/upload` | Upload manual image |
| POST | `/api/admin/publish/[id]` | Publish note |
| POST | `/api/admin/unpublish/[id]` | Unpublish note |
| GET | `/api/admin/settings` | Get automation config |
| PUT | `/api/admin/settings` | Update automation config |

### Public Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/search` | Search published posts |

### Webhook Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/webhook/rebuild` | Trigger Vercel rebuild |

## Cron Jobs

Configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/monitor",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/expand",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/publish",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

| Job | Schedule | Description |
|-----|----------|-------------|
| `/api/cron/monitor` | 2:00 AM | Fetch HN/Reddit, create idea notes |
| `/api/cron/expand` | 3:00 AM | Expand notes tagged `expand-me` |
| `/api/cron/publish` | Every 15 min | Publish scheduled notes |

## Security Model

### Token Authentication

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.nextUrl.searchParams.get('token');
    if (token !== process.env.ADMIN_TOKEN) {
      return new NextResponse(null, { status: 404 });
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token !== process.env.ADMIN_TOKEN) {
      return new NextResponse(null, { status: 404 });
    }
  }
}
```

### Environment Variables

```bash
# Required
ADMIN_TOKEN=           # 64+ char random string
DATABASE_URL=          # Neon connection string
ANTHROPIC_API_KEY=     # Claude API key
GEMINI_API_KEY=        # Google AI API key
R2_ACCOUNT_ID=         # Cloudflare account
R2_ACCESS_KEY_ID=      # R2 credentials
R2_SECRET_ACCESS_KEY=  # R2 credentials
R2_BUCKET_NAME=        # R2 bucket

# Optional
VERCEL_DEPLOY_HOOK=    # For triggering rebuilds
```

## Content Pipeline

### Markdown Frontmatter

Published posts use this frontmatter:

```yaml
---
title: "Article Title"
subtitle: "Optional subtitle"
date: 2024-01-15
tags: ["ai", "engineering"]
heroImage: "https://r2.example.com/images/2024/01/abc123/hero.png"
readingTime: 8
---
```

### Build Process

1. Next.js reads `/content/posts/**/*.md` at build time
2. Parses frontmatter and content
3. Generates static pages for each post
4. Creates tag pages and search index
5. Deploys to Vercel CDN

## Monitoring & Observability

### Logging

- Vercel's built-in logging for API routes
- Structured JSON logs for cron jobs
- Error tracking via Vercel's error monitoring

### Metrics

- Vercel Analytics for frontend performance
- Custom logging for:
  - AI generation latency
  - Image generation success rate
  - Publishing success rate

### Alerts

- Vercel deployment notifications
- Cron job failures logged with severity
