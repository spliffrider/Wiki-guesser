# Dev Container Architecture

> **FOR AI AGENTS:** This document explains the containerized development environment. Read this first when starting a session.

---

## Quick Reference

| Component | Value |
|-----------|-------|
| **Base Image** | `mcr.microsoft.com/devcontainers/javascript-node:22` |
| **Node.js** | v22 LTS |
| **Python** | 3.11 |
| **Default User** | `node` (non-root) |
| **Working Dir** | `/workspaces/wiki-guesser` |
| **Dev Server Port** | `3000` (auto-forwarded) |
| **Line Endings** | LF only (enforced via `.gitattributes`) |

---

## What Is a Dev Container?

A **Dev Container** is a Docker-based development environment that runs inside VS Code. Instead of installing tools locally on the host machine, everything runs in an isolated Linux container.

```
┌─────────────────────────────────────────────────────────────┐
│                     HOST MACHINE (Windows/Mac)              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    DOCKER CONTAINER                   │  │
│  │                                                       │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │   │   Node.js   │  │  Python 3   │  │     Git     │  │  │
│  │   │     22      │  │    3.11     │  │   + curl    │  │  │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                       │  │
│  │   ┌─────────────────────────────────────────────────┐│  │
│  │   │         /workspaces/wiki-guesser                ││  │
│  │   │         (mounted from host)                     ││  │
│  │   └─────────────────────────────────────────────────┘│  │
│  │                                                       │  │
│  │   User: node (UID 1000) ──────── Non-root for safety  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────┐                                         │
│  │ .env.local     │ ◄─── Mounted from host (secrets)        │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Why Use Dev Containers?

### 1. **Security & Isolation**
AI agents (Gemini, Claude) run inside the container with limited access:
- Cannot access host filesystem outside workspace
- Non-root user prevents system-level changes
- All changes are visible and auditable in git

### 2. **Reproducibility**
Every developer (human or AI) gets identical:
- Node.js version
- Python version  
- VS Code extensions
- Tooling configuration

### 3. **Cross-Platform Consistency**
- Host OS doesn't matter (Windows, Mac, Linux)
- Container always runs Linux internally
- Line endings are always LF (Unix-style)

---

## Architecture Deep Dive

### File: `Dockerfile`

The Dockerfile defines the container image:

```dockerfile
# Base: Microsoft's official Node.js dev container
FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Adds Python 3.11 for data mining scripts
RUN apt-get update && apt-get install -y python3.11 ...

# Installs Python dependencies for miner.py, etc.
COPY scripts/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

# Sets working directory
WORKDIR /workspaces/wiki-guesser

# Runs as 'node' user (non-root)
USER node
```

**What's Installed:**
| Tool | Purpose |
|------|---------|
| Node.js 22 | Next.js app runtime |
| Python 3.11 | Data mining scripts (`miner.py`, `opentdb_importer.py`) |
| git, curl, wget | Version control & HTTP tools |
| htop, procps | Process monitoring |
| google-generativeai | AI content generation |
| wikipedia-api | Wikipedia data fetching |

### File: `devcontainer.json`

This configures how VS Code interacts with the container:

```jsonc
{
  "name": "Wiki-Guesser Dev Container",
  
  // Build from local Dockerfile
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },
  
  // Enable Docker-in-Docker (for running containers inside container)
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  
  // Mount secrets file from host
  "mounts": [
    "source=${localWorkspaceFolder}/.env.local,target=/workspaces/wiki-guesser/.env.local,type=bind"
  ],
  
  // Run after container creation
  "postCreateCommand": "npm install",
  
  // VS Code configuration
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-python.python"
        // ...
      ]
    }
  },
  
  // Expose Next.js dev server
  "forwardPorts": [3000],
  
  // Run as non-root
  "remoteUser": "node"
}
```

---

## Agent-Specific Notes

> [!IMPORTANT]
> **Read this section carefully if you are an AI agent.**

### Git Safe Directory

When first connecting, git may report "dubious ownership" errors:

```bash
fatal: detected dubious ownership in repository at '/workspaces/antigravity/wiki-guesser'
```

**Fix it once:**
```bash
git config --global --add safe.directory /workspaces/antigravity/wiki-guesser
```

This is because the container user (`node`) has a different UID than the host user who owns the files.

### Line Endings

All files use **LF (Unix)** line endings, enforced by `.gitattributes`:

```gitattributes
* text=auto eol=lf
*.ts text eol=lf
*.tsx text eol=lf
# etc.
```

**Never commit files with CRLF.** If you see massive diffs with no visible changes, it's line ending normalization.

### File Paths

Inside the container:
- Workspace root: `/workspaces/antigravity`
- Wiki Guesser project: `/workspaces/antigravity/wiki-guesser`
- Python scripts: `/workspaces/antigravity/wiki-guesser/scripts/`

### Environment Variables

Secrets are in `.env.local` (mounted from host, never committed):

```bash
# Expected variables:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
GOOGLE_AI_API_KEY=AIza...  # For miner.py
```

### Running the App

```bash
cd /workspaces/antigravity/wiki-guesser
npm run dev  # Starts on http://localhost:3000
```

The port is automatically forwarded to the host.

### Running Python Scripts

```bash
cd /workspaces/antigravity/wiki-guesser/scripts
python miner.py  # Content generation
python opentdb_importer.py  # Import trivia questions
```

---

## Troubleshooting

### Container Won't Start

1. **Docker not running** - Ensure Docker Desktop is running on host
2. **Port conflict** - Another process using port 3000
3. **Out of disk space** - Docker images are large (~2GB)

### Permission Errors

- Files are owned by `node:node` inside container
- If you see `EACCES` errors, check that `remoteUser: "node"` is set

### npm Install Fails

Check:
1. Network connectivity (container needs internet)
2. `package-lock.json` integrity
3. Node version matches (should be v22)

### Python Scripts Fail

```bash
# Verify Python is available
python --version  # Should show 3.11.x

# Verify packages
pip list | grep google-generativeai
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                      TRUST BOUNDARIES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HOST MACHINE                                               │
│  ├── Full system access                                     │
│  ├── Docker daemon control                                  │
│  └── All filesystems                                        │
│                                                             │
│      ▼ (container boundary)                                 │
│                                                             │
│  CONTAINER                                                  │
│  ├── Only sees /workspaces mount                           │
│  ├── Runs as 'node' (non-root)                             │
│  ├── Cannot install system packages without sudo           │
│  └── Network access (required for npm, APIs)               │
│                                                             │
│      ▼ (file boundary)                                      │
│                                                             │
│  .env.local                                                 │
│  ├── Contains secrets (API keys, DB credentials)           │
│  ├── Mounted read-only from host                           │
│  └── NEVER committed to git                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What AI agents CAN do:**
- Read/write any file in `/workspaces`
- Run Node.js and Python scripts
- Make network requests (APIs, npm, etc.)
- Start dev servers on forwarded ports

**What AI agents CANNOT do:**
- Access files outside `/workspaces`
- Install system packages (apt-get requires sudo)
- Modify Docker configuration
- Access other containers or host processes

---

## Related Files

| File | Purpose |
|------|---------|
| `.devcontainer/Dockerfile` | Container image definition |
| `.devcontainer/devcontainer.json` | VS Code dev container config |
| `.gitattributes` | Line ending enforcement |
| `scripts/requirements.txt` | Python dependencies |
| `.env.local` | Environment secrets (not in git) |

---

*Last updated: 2025-12-27*
