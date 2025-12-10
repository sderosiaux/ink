# Context

## Problem

Writing and publishing content is fragmented across multiple tools and platforms:

- Ideas live in scattered notes, bookmarks, and browser tabs
- HN threads and Reddit discussions contain valuable insights but require manual synthesis
- Drafting requires switching between AI tools, editors, and publishing platforms
- Image generation is a separate manual workflow
- Publishing to a blog requires manual formatting and deployment
- There's no single place to see what's in progress, what's ready, and what's published

The friction between "having an idea" and "publishing polished content" is too high.

## Target User

Single author (you). No multi-user support. No collaboration features.

## Goals

1. **Single input point**: Drop notes, URLs, or raw ideas in one place
2. **AI-powered drafting**: System transforms input into polished articles using your voice and style
3. **Automated visuals**: Generate hero images and illustrations without leaving the platform
4. **Simple review workflow**: See all content in one list, edit, approve, schedule
5. **One-click publish**: Content goes live on your blog instantly
6. **Background automation**: System monitors sources (HN, Reddit) and surfaces relevant content overnight

## Non-Goals

- Multi-user / collaboration
- Cross-posting to Medium, Substack, LinkedIn, X (copy-paste is fine)
- Comments system
- Analytics dashboard (use external tools)
- Complex approval workflows
- Version control UI (git handles this under the hood)

## Success Metrics

- Time from idea to published article < 30 minutes (for AI-assisted drafts)
- Zero context switching between tools during the writing flow
- 100% of content stored in git-versioned markdown
- Blog loads in < 1 second (LCP)

## Constraints

- Single tenant, self-hosted
- Budget-conscious: use free tiers where possible (Vercel, Neon, R2)
- TypeScript throughout
- Anthropic Claude for text generation
- Gemini Nano Banana Pro for image generation (with manual fallback via prompts)
