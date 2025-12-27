# Agent Prompts

This directory contains detailed task prompts for agents.

## How to Use

1. Create a file like `feature-name-agent.md` (e.g., `multiplayer-claude.md`)
2. Add detailed requirements, context, and acceptance criteria
3. Reference it in `handoffs.md`:
   ```markdown
   | 1 | YOU | CLAUDE | `.agent/prompts/multiplayer-claude.md` | 🆕 New |
   ```
4. Tell the agent: "Run /sync and pick up your work"

## File Naming Convention

```
[feature]-[agent].md

Examples:
- multiplayer-claude.md    (backend work for Claude)
- multiplayer-gemini.md    (frontend work for Gemini)
- auth-redesign-gemini.md  (auth UI for Gemini)
```

## Prompt Template

```markdown
# [Task Title]

## Context
What's the background? What already exists?

## Requirements
- Specific things to build
- Acceptance criteria

## Files to Reference
- `path/to/file.ts` - description

## Constraints
- Tech stack requirements
- Design patterns to follow
- Things to avoid

## Handoff Notes
What the receiving agent should do when done
```
