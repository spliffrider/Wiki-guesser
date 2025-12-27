# Multiplayer UI Polish - Frontend

> **Agent**: GEMINI
> **Status**: 🆕 New
> **Priority**: Medium
> **Depends on**: `multiplayer-claude.md` ✅ Complete

## Context

Oscar (Claude) has completed the multiplayer backend. The lobby UI needs polish to match the Encyclopedia theme and feel alive with animations.

## Files to Modify

### [page.module.css](file:///c:/antigravity/wiki-guesser/src/app/play/multi/[code]/page.module.css)

Add these animations at the top of the file after `.main`:

```css
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOutShrink {
    to { transform: scale(0.8); opacity: 0; }
}

@keyframes readyPulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--color-success-glow); }
    50% { box-shadow: 0 0 20px 10px var(--color-success-glow); }
}

@keyframes breathe {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}
```

Update these selectors:

1. **`.roomHeader h1`** - Add `font-family: var(--font-serif);`
2. **`.roomCode`** - Add `letter-spacing: 0.15em; color: var(--color-gold);`
3. **`.playerCard`** - Add animation: `animation: slideInRight 0.3s ease-out;`
4. **`.playerCard`** - Book-plate styling:
   - `border: 2px solid var(--color-border-subtle);`
   - `border-radius: var(--border-radius-lg);`
   - `background: var(--color-bg-primary);`
   - `box-shadow: var(--shadow-md);`
   - `margin-bottom: var(--space-3);`
5. **`.readyStatus.ready`** - Add `animation: readyPulse 2s infinite;`
6. **`.startBtn`** - Add `background: var(--color-gold);` for gold accent
7. **`.countdownNumber`** - Enhance scale animation with spring easing

### [page.tsx](file:///c:/antigravity/wiki-guesser/src/app/play/multi/[code]/page.tsx)

1. **Import avatars**: `import { getAvatarEmoji } from '@/lib/avatars';`
2. **Add copy code button**:
   ```tsx
   const handleCopyCode = () => {
       navigator.clipboard.writeText(code);
       // Optional: setState for brief visual feedback
   };
   ```
3. **Enhance player card display**:
   - Show avatar emoji before username: `getAvatarEmoji(profile?.avatar_url)`
   - Add avatar wrapper div with styling
4. **Animated countdown**: Replace static "3" with state-driven 3→2→1

## Design Reference

- **Font**: EB Garamond (headings), Lato (body) - already in `--font-serif`
- **Gold accent**: `--color-gold` (#C9A227) and `--shadow-glow-gold`
- **Book-plate style**: Subtle border, paper background, gentle shadow
- **Animation timing**: Use `--transition-spring` for bouncy effects

## Acceptance Criteria

- [ ] Room code uses EB Garamond with gold color
- [ ] Copy button with clipboard icon (📋)
- [ ] Player cards slide in from right when joining
- [ ] Ready status pulses with green glow
- [ ] Countdown animates 3→2→1 with scale
- [ ] Start button has gold accent
- [ ] Works on all 3 dark modes
- [ ] Mobile responsive (44px min tap targets)
