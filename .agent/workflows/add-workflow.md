---
description: Create a new workflow - managed by Paul
---

# Create New Workflow

Use this workflow to create a new slash-command workflow.

## Required Information

1. **Workflow name** (becomes the slash command, e.g., "database-migration" → /database-migration)
2. **Description** - One line explaining when to use it
3. **Steps** - What should the workflow guide through?
4. **Turbo commands** - Any safe-to-auto-run commands?

## Paul's Process

Paul will:
1. Check if a similar workflow already exists
2. Design the workflow structure
3. Add appropriate turbo annotations for safe commands
4. Create the file in `.agent/workflows/`
5. Verify it appears in the available workflows list

## Workflow Best Practices

- Keep steps actionable and specific
- Include verification steps
- Mark safe read-only commands with `// turbo`
- Reference related workflows where appropriate
