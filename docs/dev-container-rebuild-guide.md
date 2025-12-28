# Rebuilding VS Code Dev Container with Port Forwarding

## Quick Reference

When you rebuild the dev container in VS Code, it will:
1. ✅ Preserve your code (mounted from host)
2. ✅ Apply port forwarding from `devcontainer.json`
3. ❌ Lose any installed packages (fixed by `postCreateCommand`)

---

## Steps to Rebuild

### 1. Open VS Code and Attach to Container
- Open VS Code
- Press `Ctrl+Shift+P`
- Select "Dev Containers: Attach to Running Container"
- Choose `zen_tesla` (or your container name)

### 2. Rebuild the Container
- Once attached, press `Ctrl+Shift+P`
- Select "Dev Containers: Rebuild Container"
- Wait for rebuild to complete (2-5 minutes)

### 3. Verify Port Forwarding
- Check the "PORTS" tab in VS Code's bottom panel
- Port 3000 should be listed with status "Forwarded"
- If not visible, click "+" and add port `3000`

### 4. Start the Dev Server
```bash
npm run dev -- --hostname 0.0.0.0
```

### 5. Access the App
- Open browser: `http://localhost:3000`
- Or click the globe icon next to port 3000 in VS Code

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port not forwarding | Right-click port → "Forward a Port" |
| "Connection refused" | Ensure server is running with `--hostname 0.0.0.0` |
| Container won't start | Check Docker Desktop is running |
| Packages missing | Run `npm install` after rebuild |

---

## Important Notes

- **VS Code must stay open** for port forwarding to work
- Port forwarding is managed by VS Code, not Docker directly
- The `devcontainer.json` already has `"forwardPorts": [3000]` configured
- Using `--hostname 0.0.0.0` ensures the server binds to all interfaces
