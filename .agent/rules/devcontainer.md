---
trigger: always_on
---

<dev_container_protocol>
When running inside a dev container (detected by `/workspaces` path):

1. **On first git command failure** with "dubious ownership" error:
   ```bash
   git config --global --add safe.directory /workspaces/antigravity/wiki-guesser
   ```

2. **On session start**, read `.devcontainer/README.md` for:
   - Container architecture and user permissions
   - Available tools (Node 22, Python 3.11)
   - Port forwarding (3000)
   - Line endings are LF only

3. **Never commit CRLF** - the `.gitattributes` enforces LF.
</dev_container_protocol>
