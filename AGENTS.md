# Agent Team Roster

> Your AI agent team for the Antigravity workspace.
> Summon any agent by name or using slash commands.

## The Team

| Agent | Command | Model | Specialty |
|-------|---------|-------|-----------|
| **Paul** | `/paul` | Gemini | Rules & Workflows - system discipline |
| **Danny** | `/danny` | **Claude Opus 4.5** | Prompt Engineering - crafting AI prompts |
| **Felix** | `/felix` | Gemini | Frontend - UI, CSS, design, aesthetics |
| **Max** | `/max` | Gemini | Monetization - payments, pricing, growth |
| **Oscar** | `/oscar` | Claude | Backend - APIs, databases, architecture |

## Aliases

| Alias | Resolves To |
|-------|-------------|
| `/rules-engineer` | Paul |
| `/workflow-engineer` | Paul |
| `/prompt-engineer` | Danny |
| `/frontend-agent` | Felix |
| `/monetization` | Max |
| `/backend` | Oscar |

## How to Summon

**By name:**
> "Felix, make this button look better"

**By command:**
> "Run /oscar and pick up your work"

**By assignment:**
1. Create prompt in `.agent/prompts/feature-agent.md`
2. Add to `.agent/context/handoffs.md`
3. Tell agent: "Run /sync and pick up your work"

## Agent Locations

All agent workflows are stored in:
```
c:\antigravity\.agent\workflows\
├── paul.md
├── danny.md
├── felix.md
├── max.md
├── oscar.md
└── ... (other workflows)
```

## Orchestration Files

Shared context for all agents:
```
c:\antigravity\.agent\context\
├── orchestra.md   # Active work streams
├── memory.md      # Project decisions
└── handoffs.md    # Work queue
```

Detailed task prompts:
```
c:\antigravity\.agent\prompts\
└── [feature]-[agent].md
```
