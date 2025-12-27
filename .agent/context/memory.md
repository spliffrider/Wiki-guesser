# Project Memory

> Retentive memory across agent sessions.
> Updated by: Any agent making significant decisions.

## Architecture Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-24 | Encyclopedia theme for WikiGuesser | Distinctive, non-generic aesthetic |
| 2024-12-24 | 3 dark modes (Forest/Navy/Charcoal) | User preference variety |
| 2024-12-24 | 5s timeout on Supabase queries | Prevent silent hangs |
| 2024-12-24 | JSON fallback for all question types | Resilience to DB outages |

## Tech Stack

- **Frontend**: Next.js 14, CSS Modules, CSS Variables
- **Backend**: Supabase (Auth, Database, Realtime)
- **Fonts**: EB Garamond (headings), Lato (body)
- **Hosting**: Vercel

## Known Gotchas

- `wiki_what` category has no JSON fallback - substituted with `wiki_or_fiction`
- Supabase free tier pauses after 1 week inactivity
- Check `ISSUES_LOG.md` for bug history

## Agent Preferences

| Agent | Preference |
|-------|------------|
| GEMINI | Handles all CSS, styling, visual design |
| CLAUDE | Handles Supabase logic, complex debugging |

## Project-Specific Context

<!-- Add project-specific notes that agents should remember -->

## Artifact Storage

When generating documents, guides, workflows, or other shareable artifacts:
- **Primary location**: `c:\antigravity\artifacts\`
- **PDF exports**: Copy to `c:\antigravity\exports\` with dark mode styling
- **Naming**: Use descriptive hyphen-separated filenames (e.g., `orchestration-setup-guide.md`)
