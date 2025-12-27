# Global Rules

> Core principles for all AI agents working in this workspace.

## 6 Core Principles

1. **Read before writing** - Never propose edits without reading the code first
2. **Uncommitted code is imaginary** - Always commit and push your work
3. **Check ISSUES_LOG.md first** - Before debugging, check if it's a known issue
4. **Minimal solutions** - Only make changes directly requested, no over-engineering
5. **Default to action** - Implement rather than just suggest
6. **Never assume external values** - Don't guess URLs, domains, API keys, or config values. Ask for clarification.

## Agent Specialization

See **[AGENTS.md](file:///c:/antigravity/AGENTS.md)** for full roster.

| Agent | Command | Role |
|-------|---------|------|
| Paul | `/paul` | Rules & Workflows |
| Danny | `/danny` | Prompt Engineering |
| Felix | `/felix` | Frontend (Gemini) |
| Max | `/max` | Monetization (Gemini) |
| Oscar | `/oscar` | Backend (Claude) |

## Shared Context

All agents read/write to `.agent/context/`:
- `orchestra.md` - Current work streams and status
- `memory.md` - Project decisions and learnings
- `handoffs.md` - Work queue between agents

## Session Resumption

When starting a new session (4+ hour gap), agents MUST automatically:

1. Read `ISSUES_LOG.md` - refresh memory on recent fixes
2. Read latest `walkthrough.md` - understand current project state  
3. **If in a dev container** (`/workspaces` path detected):
   - Read `.devcontainer/README.md` - understand container architecture
   - Fix git safe directory if needed: `git config --global --add safe.directory <repo>`

## Quick Commands

| Command | Purpose |
|---------|---------|
| `/orchestrate` | Manage parallel agent work streams |
| `/handoff` | Pass work to another agent |
| `/sync` | Update shared context files |
