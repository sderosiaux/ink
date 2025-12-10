# Test Strategy

## Overview

This document defines what we must test to ensure the publishing engine works correctly and reliably.

## Testing Principles

1. **Test behavior, not implementation** — Tests should verify user outcomes
2. **Fast feedback** — Unit tests run in < 5 seconds
3. **Realistic data** — Integration tests use realistic note content
4. **Fail loudly** — Critical paths must have explicit assertions

## Test Categories

### 1. Unit Tests

Fast, isolated tests for core logic. No external dependencies.

### 2. Integration Tests

Tests that involve database, external APIs (mocked), or file system.

### 3. E2E Tests

Full user flows through the actual UI.

### 4. Non-Functional Tests

Performance, security, and resilience checks.

---

## Unit Tests

### URL Extraction

```gherkin
Feature: URL extraction from note content

Scenario: Extract single URL from text
  Given content "Check out https://news.ycombinator.com/item?id=12345 for details"
  When I extract URLs
  Then I get ["https://news.ycombinator.com/item?id=12345"]

Scenario: Extract multiple URLs
  Given content with 3 different URLs embedded in text
  When I extract URLs
  Then I get all 3 URLs in order of appearance

Scenario: No URLs in content
  Given content "Just some plain text notes"
  When I extract URLs
  Then I get empty array

Scenario: URL classification - HN thread
  Given URL "https://news.ycombinator.com/item?id=12345"
  When I classify the URL
  Then type is "hn_thread"

Scenario: URL classification - Reddit thread
  Given URL "https://reddit.com/r/programming/comments/abc123"
  When I classify the URL
  Then type is "reddit_thread"

Scenario: URL classification - Generic article
  Given URL "https://example.com/blog/some-article"
  When I classify the URL
  Then type is "article"
```

### Slug Generation

```gherkin
Feature: Slug generation from title

Scenario: Simple title
  Given title "Hello World"
  When I generate slug
  Then slug is "hello-world"

Scenario: Title with special characters
  Given title "What's Next? A Guide to AI/ML"
  When I generate slug
  Then slug is "whats-next-a-guide-to-ai-ml"

Scenario: Title with numbers
  Given title "10 Things About GPT-4"
  When I generate slug
  Then slug is "10-things-about-gpt-4"

Scenario: Very long title
  Given title with 100+ characters
  When I generate slug
  Then slug is truncated to 80 characters at word boundary

Scenario: Duplicate slug handling
  Given slug "hello-world" already exists
  When I generate slug for another "Hello World" title
  Then slug is "hello-world-2"
```

### Status Transitions

```gherkin
Feature: Note status transitions

Scenario: Valid transition idea → draft
  Given note with status "idea"
  When I transition to "draft"
  Then status is "draft"

Scenario: Valid transition draft → ready
  Given note with status "draft"
  When I transition to "ready"
  Then status is "ready"

Scenario: Valid transition ready → scheduled
  Given note with status "ready" and scheduledAt set
  When I transition to "scheduled"
  Then status is "scheduled"

Scenario: Invalid transition idea → published
  Given note with status "idea"
  When I attempt transition to "published"
  Then error "Cannot publish directly from idea status"

Scenario: Archive from any state
  Given note with any status
  When I transition to "archived"
  Then status is "archived"
```

### Markdown Frontmatter

```gherkin
Feature: Frontmatter generation

Scenario: Complete frontmatter
  Given note with title, subtitle, tags, heroImage, publishedAt
  When I generate frontmatter
  Then YAML contains all fields correctly formatted

Scenario: Reading time calculation
  Given note content with 1600 words
  When I generate frontmatter
  Then readingTime is 8 (assuming 200 wpm)

Scenario: Missing optional fields
  Given note without subtitle
  When I generate frontmatter
  Then subtitle field is omitted (not null)
```

### Markdown Cleaning (Import)

```gherkin
Feature: Clean imported markdown

Scenario: Fix Medium embeds
  Given markdown with Medium embed HTML
  When I clean the markdown
  Then embeds are converted to plain links

Scenario: Normalize headings
  Given markdown with inconsistent heading levels (h1, h3, h2)
  When I clean the markdown
  Then headings follow proper hierarchy

Scenario: Preserve code blocks
  Given markdown with fenced code blocks
  When I clean the markdown
  Then code blocks are untouched

Scenario: Strip HTML entities
  Given markdown with &amp; and &nbsp;
  When I clean the markdown
  Then entities are converted to characters
```

---

## Integration Tests

### Database Operations

```gherkin
Feature: Note CRUD operations

Scenario: Create note
  Given valid note data
  When I call createNote()
  Then note is saved with generated id
  And createdAt is set
  And updatedAt equals createdAt

Scenario: Update note
  Given existing note with id
  When I call updateNote() with new content
  Then content is updated
  And updatedAt is refreshed
  And createdAt is unchanged

Scenario: Delete note
  Given existing note with id
  When I call deleteNote()
  Then note is removed
  And associated images are removed

Scenario: List notes with filters
  Given 10 notes with various statuses and tags
  When I call listNotes({ status: 'draft', tags: ['ai'] })
  Then only matching notes are returned

Scenario: Search notes
  Given notes containing "machine learning" in content
  When I call searchNotes("machine learning")
  Then matching notes are returned ranked by relevance
```

### Image Storage

```gherkin
Feature: R2 image operations

Scenario: Upload image
  Given image buffer and metadata
  When I call uploadImage()
  Then image is stored in R2
  And URL is returned with correct path structure

Scenario: Delete image
  Given existing image URL
  When I call deleteImage()
  Then image is removed from R2

Scenario: Upload with correct path
  Given note from January 2024 with id "abc123"
  When I upload image with id "img456"
  Then path is "images/2024/01/abc123/img456.png"
```

### AI Generation (Mocked)

```gherkin
Feature: AI draft generation

Scenario: Generate from plain text
  Given note with plain text content
  And mocked Anthropic response
  When I call generateDraft()
  Then draft follows writing guidelines
  And contains [VISUAL: ...] placeholders

Scenario: Generate from HN URL
  Given note containing HN thread URL
  And mocked HN API response
  And mocked Anthropic response
  When I call generateDraft()
  Then draft incorporates thread analysis
  And critical thinking section is included

Scenario: Handle API timeout
  Given Anthropic API timeout after 30s
  When I call generateDraft()
  Then error is thrown with "AI generation timed out"
  And note status is unchanged

Scenario: Handle rate limit
  Given Anthropic returns 429
  When I call generateDraft()
  Then error includes retry guidance
```

### Publishing

```gherkin
Feature: Note publishing

Scenario: Publish note
  Given note with status "ready"
  When I call publishNote()
  Then markdown file is created in /content/posts/[year]/[month]/[slug].md
  And file contains correct frontmatter
  And note status is "published"
  And publishedAt is set
  And Vercel deploy hook is triggered

Scenario: Publish with images
  Given note with heroImage and 2 inline images
  When I call publishNote()
  Then frontmatter contains heroImage URL
  And markdown content has image URLs (not placeholders)

Scenario: Unpublish note
  Given published note
  When I call unpublishNote()
  Then markdown file is deleted
  And note status is "archived"
  And Vercel deploy hook is triggered

Scenario: Publish collision
  Given slug "hello-world" already has published file
  When I publish another note with same slug
  Then new slug is "hello-world-2"
  And file is created with new slug
```

---

## E2E Tests

### Backoffice Access

```gherkin
Feature: Backoffice authentication

Scenario: Access with valid token
  Given valid ADMIN_TOKEN
  When I navigate to /admin?token={token}
  Then I see the content list

Scenario: Access with invalid token
  When I navigate to /admin?token=wrong
  Then I see 404 page

Scenario: Access without token
  When I navigate to /admin
  Then I see 404 page

Scenario: Token persisted across navigation
  Given I accessed /admin?token={token}
  When I navigate within admin (e.g., to editor)
  Then token is preserved in URL
  And I remain authenticated
```

### Note Management

```gherkin
Feature: Note creation and editing

Scenario: Create new note
  Given I'm on the content list
  When I click "New Note"
  And I enter content "My first idea"
  And I click save
  Then note appears in the list with status "idea"

Scenario: Edit note
  Given existing note in the list
  When I click on the note
  And I modify the content
  Then changes are auto-saved (debounced)
  And I see "Saved" indicator

Scenario: Add tags
  Given I'm editing a note
  When I type a new tag and press enter
  Then tag is added to the note
  And tag appears in the tag list

Scenario: Change status
  Given note with status "idea"
  When I change status dropdown to "draft"
  Then status is updated immediately
  And list shows new status badge

Scenario: Delete note
  Given existing note
  When I click delete and confirm
  Then note is removed from the list
```

### AI Generation Flow

```gherkin
Feature: AI draft generation in UI

Scenario: Generate draft
  Given note with content
  When I click "Generate Draft"
  Then I see loading indicator
  And content updates progressively (streaming)
  And final content includes generated draft

Scenario: Generate images
  Given note with [VISUAL: ...] placeholders
  When I click "Generate Images"
  Then I see image variants for each placeholder
  When I select a variant
  Then placeholder is replaced with image URL
```

### Publishing Flow

```gherkin
Feature: Publishing from UI

Scenario: Publish note
  Given note with status "ready"
  When I click "Publish"
  Then I see success message
  And status changes to "published"
  And "View on blog" link appears

Scenario: Schedule note
  Given note with status "ready"
  When I set scheduled date to tomorrow
  And I change status to "scheduled"
  Then note shows scheduled badge
  And scheduled date is displayed

Scenario: Preview note
  Given any note
  When I click "Preview"
  Then I see the note rendered as it would appear on the blog
  And styles match the public blog
```

### Blog Frontend

```gherkin
Feature: Public blog

Scenario: Homepage loads
  When I navigate to /
  Then I see featured latest post
  And I see list of recent posts
  And page loads in < 1 second

Scenario: Article page
  Given published post with slug "hello-world" from January 2024
  When I navigate to /2024/01/hello-world
  Then I see the full article
  And hero image is displayed
  And reading time is shown

Scenario: Tag page
  Given posts with tag "ai"
  When I navigate to /tags/ai
  Then I see all posts with that tag

Scenario: Search
  Given published posts containing "machine learning"
  When I search for "machine learning"
  Then matching posts appear in results
```

---

## Non-Functional Tests

### Performance

```gherkin
Feature: Performance requirements

Scenario: Blog homepage LCP
  When I measure homepage Largest Contentful Paint
  Then LCP is < 1000ms

Scenario: API response time
  When I call GET /api/admin/notes
  Then response time is < 200ms for up to 100 notes

Scenario: AI generation doesn't block
  When AI generation is in progress
  Then other API calls still respond normally
```

### Security

```gherkin
Feature: Security checks

Scenario: SQL injection prevention
  Given malicious input with SQL injection attempt
  When used in note content or search
  Then query is parameterized
  And no SQL execution occurs

Scenario: XSS prevention
  Given markdown with <script> tags
  When rendered on blog
  Then scripts are sanitized
  And no JS executes

Scenario: Token not leaked in logs
  When API request is logged
  Then token is redacted

Scenario: Image URL validation
  Given image URL from external domain
  When rendering article
  Then only R2 domain images are displayed
```

### Resilience

```gherkin
Feature: Graceful degradation

Scenario: Database unavailable
  When database connection fails
  Then API returns 503 with retry header
  And error is logged

Scenario: R2 unavailable
  When R2 upload fails
  Then user sees error message
  And can retry
  And note is not corrupted

Scenario: AI API unavailable
  When Anthropic API is down
  Then generation fails gracefully
  And user can still edit manually
  And note content is preserved
```

### Data Integrity

```gherkin
Feature: Data integrity

Scenario: Concurrent edits
  Given two browser tabs editing same note
  When both save simultaneously
  Then later save wins (last-write-wins)
  And no data corruption

Scenario: Partial publish failure
  Given publish starts successfully
  When Vercel deploy hook fails
  Then file is still created
  And note status is "published"
  And error is logged for manual retry
```

---

## Test Infrastructure

### Tools

| Category | Tool |
|----------|------|
| Unit/Integration | Vitest |
| E2E | Playwright |
| API testing | Vitest + fetch |
| Mocking | Vitest mocks, MSW |
| Coverage | Vitest coverage (v8) |

### Commands

```bash
# Run unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run integration tests (requires test DB)
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run all tests with coverage
pnpm test:coverage
```

### CI Pipeline

```yaml
# .github/workflows/test.yml
- Unit tests on every push
- Integration tests on PR
- E2E tests on PR to main
- Coverage report as PR comment
```

### Test Database

- Separate Neon database for tests
- Reset between test suites
- Seeded with fixture data

---

## What We Must Never Break

Critical invariants that tests must protect:

1. **Published content is never lost** — Publishing creates a file, unpublishing archives (not deletes note)
2. **Token auth always enforced** — No admin route accessible without valid token
3. **Generated content is editable** — AI output can always be modified before publish
4. **Images are correctly linked** — Hero and inline images resolve to valid URLs
5. **Blog builds succeed** — Invalid markdown cannot be published
6. **Scheduled posts publish on time** — Cron job reliability

---

## Coverage Targets

| Category | Target |
|----------|--------|
| Core business logic | 90% |
| API routes | 80% |
| UI components | 70% |
| Overall | 80% |

Critical paths (auth, publish, AI generation) must have 100% coverage.
