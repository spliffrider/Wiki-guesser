# Handoffs Queue

> Work items to be passed between agents.
> Reference detailed prompts from `.agent/prompts/` directory.

## Pending Handoffs

| # | From | To | Prompt File | Status |
|---|------|----|-------------|--------|
| - | - | - | - | 🆕 No pending handoffs |

## Status Legend
- 🆕 New - Just added, not picked up
- 🔄 In Progress - Being worked on
- ✅ Complete - Done, can be archived

## How to Add a Handoff

1. Create detailed prompt in `.agent/prompts/[feature]-[agent].md`
2. Add row to this table:
   ```markdown
   | 1 | YOU | CLAUDE | `.agent/prompts/multiplayer-claude.md` | 🆕 New |
   ```
3. Tell the agent: "Run /sync and pick up your work"

## Completed Handoffs

| # | From | To | Prompt | Completed |
|---|------|----|--------|-----------|
| 2 | USER | GEMINI | Multiplayer UI Polish | 2025-12-25 |
| 1 | USER | CLAUDE | Multiplayer Backend | 2025-12-25 |
