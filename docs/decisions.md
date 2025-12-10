# Decision Log

## ADR-001: Single Content Type (Note)

**Date**: 2024-12-10

**Decision**: Use a single "Note" entity for all content types (ideas, links, drafts, articles).

**Context**: Initial PRD distinguished between "ideas" and "links" as separate concepts. This would require separate tables, separate UIs, and logic to handle conversions.

**Options Considered**:
1. Separate entities (Idea, Link, Draft, Article)
2. Single entity with status field
3. Single entity with type + status fields

**Choice**: Option 2 — Single entity with status field.

**Reason**:
- A "link" is just a note with a URL in the content
- Status flow (idea → draft → published) is the same regardless of input type
- Simpler data model, simpler UI, less code
- URL detection can be automatic (parse content for URLs)

**Consequences**:
- No explicit "type" field needed
- URLs extracted automatically and stored in `urls[]` for quick filtering
- All content goes through the same pipeline

---

## ADR-002: Database Over Pure File-Based Storage

**Date**: 2024-12-10

**Decision**: Use Neon Postgres for notes and metadata. Git/files only for published posts.

**Context**: Original discussion suggested using git for everything. However, the backoffice needs fast filtering, sorting, and search across potentially hundreds of notes.

**Options Considered**:
1. Pure file-based (markdown + frontmatter in git)
2. Pure database (Postgres for everything)
3. Hybrid (database for working notes, files for published)

**Choice**: Option 3 — Hybrid approach.

**Reason**:
- Database enables fast queries: filter by status, search content, sort by date
- Database handles job state (cron runs, scheduled publishing)
- Published posts as markdown files enables:
  - Git history for published content
  - Easy backup (just clone the repo)
  - Standard SSG workflow
  - Content portability

**Consequences**:
- Need to sync database → files on publish
- Two sources of truth (DB for drafts, files for published)
- Slightly more complex, but better UX in backoffice

---

## ADR-003: Token-Based Auth Without Login UI

**Date**: 2024-12-10

**Decision**: Protect backoffice with a query parameter token. No login form, no sessions.

**Context**: Single-user system. Full auth system is overkill.

**Options Considered**:
1. Full auth (NextAuth, sessions, login form)
2. Basic HTTP auth
3. Query parameter token
4. IP allowlist

**Choice**: Option 3 — Query parameter token.

**Reason**:
- Simplest implementation
- Bookmark `/admin?token=xxx` for easy access
- No session management needed
- Token in URL is acceptable for single-user (not shared)
- 64+ char token is secure enough

**Consequences**:
- Token visible in browser history (acceptable for personal use)
- Must use HTTPS (Vercel handles this)
- Return 404 on invalid token (hide existence of admin routes)

---

## ADR-004: No Version Control UI

**Date**: 2024-12-10

**Decision**: Remove versioning feature from scope. Git handles history implicitly.

**Context**: PRD mentioned version history, compare, rollback. User clarified this is not needed.

**Options Considered**:
1. Full version control (snapshots on every save)
2. Git-based history with UI
3. No versioning UI

**Choice**: Option 3 — No versioning UI.

**Reason**:
- Published content is in git (history available via git commands)
- Draft content in database doesn't need formal versioning
- Adds significant complexity for unclear benefit
- Can always add later if needed

**Consequences**:
- No "compare versions" feature
- No "rollback" button
- Users can recover via git if needed

---

## ADR-005: Simple List Over Kanban Board

**Date**: 2024-12-10

**Decision**: Use a filterable list view instead of a Kanban board for content management.

**Context**: PRD mentioned "Kanban style" board. User clarified they want something simpler.

**Options Considered**:
1. Full Kanban board (drag-and-drop between columns)
2. Simple list with status badges and filters
3. Multiple tabs (one per status)

**Choice**: Option 2 — Simple list with filters.

**Reason**:
- Kanban is visual overhead for single user
- List with filters is faster to scan
- Status changes via dropdown are quick enough
- Less UI code to build and maintain

**Consequences**:
- No drag-and-drop status changes
- Status changed via dropdown in row or editor
- Filter by status to see "board-like" views

---

## ADR-006: Drizzle ORM

**Date**: 2024-12-10

**Decision**: Use Drizzle ORM for database access.

**Context**: Need a type-safe way to interact with Postgres.

**Options Considered**:
1. Prisma
2. Drizzle
3. Raw SQL with pg client
4. Kysely

**Choice**: Option 2 — Drizzle.

**Reason**:
- Excellent TypeScript support
- SQL-like syntax (less magic than Prisma)
- Lightweight, fast
- Good Neon integration
- No generation step required

**Consequences**:
- Schema defined in TypeScript
- Migrations via drizzle-kit

---

## ADR-007: Vercel Cron for Background Jobs

**Date**: 2024-12-10

**Decision**: Use Vercel Cron for scheduled background jobs.

**Context**: Need to run periodic jobs for source monitoring, note expansion, and scheduled publishing.

**Options Considered**:
1. External cron service (cron-job.org, EasyCron)
2. Vercel Cron
3. Inngest / Trigger.dev
4. Self-hosted worker

**Choice**: Option 2 — Vercel Cron.

**Reason**:
- Native integration with Vercel
- Free tier includes cron jobs
- Simple configuration in vercel.json
- No external dependencies

**Consequences**:
- Jobs run as API routes (max 10s on hobby, 60s on pro)
- For longer jobs, may need to chunk work or upgrade
- Job state tracked in database

---

## ADR-008: Cloudflare R2 for Image Storage

**Date**: 2024-12-10

**Decision**: Use Cloudflare R2 for storing generated and uploaded images.

**Context**: Need reliable, fast image hosting with reasonable cost.

**Options Considered**:
1. Vercel Blob
2. Cloudflare R2
3. AWS S3
4. Store in git repo

**Choice**: Option 2 — Cloudflare R2.

**Reason**:
- S3-compatible API
- Generous free tier (10GB storage, no egress fees)
- Global CDN built-in
- Cost-effective at scale

**Consequences**:
- Need Cloudflare account
- Use S3 SDK with R2 endpoint
- Images served via Cloudflare CDN

---

## ADR-009: SSG Over SSR for Blog

**Date**: 2024-12-10

**Decision**: Use Static Site Generation (SSG) for the public blog, not Server-Side Rendering (SSR).

**Context**: Blog is read-heavy, content changes infrequently.

**Options Considered**:
1. SSG (build-time generation)
2. SSR (request-time rendering)
3. ISR (Incremental Static Regeneration)

**Choice**: Option 1 — SSG.

**Reason**:
- Fastest possible page loads (CDN-served static HTML)
- Content rarely changes (rebuild on publish is fine)
- Simpler caching model
- Lower Vercel costs (no function invocations for reads)

**Consequences**:
- Must trigger rebuild on publish/unpublish
- Use Vercel deploy hooks
- Slight delay between publish and live (build time)

---

## ADR-010: Gemini Imagen API for Image Generation

**Date**: 2024-12-10

**Decision**: Use Google's Gemini Imagen API for AI image generation.

**Context**: User specified "Gemini Nano Banana Pro" as the image model. This appears to be a working name or internal reference to Google's image generation capabilities.

**Options Considered**:
1. OpenAI DALL-E 3
2. Google Gemini Imagen
3. Stability AI
4. Multiple providers

**Choice**: Option 2 — Google Gemini Imagen.

**Reason**:
- User preference
- Good quality output
- Reasonable pricing
- Single provider simplifies implementation

**Consequences**:
- Prompts visible in UI for manual fallback (if API unavailable)
- May need to adjust model name based on actual API availability
- Manual upload as fallback for unsupported generation requests
