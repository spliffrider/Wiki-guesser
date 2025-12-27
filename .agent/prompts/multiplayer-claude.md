# Multiplayer Room System - Backend

> **Agent**: CLAUDE
> **Status**: 🆕 New
> **Priority**: High

## Context

WikiGuesser needs real-time multiplayer support. Players should be able to create rooms, share a code, and play together. The frontend UI already exists at `/play/multi` but needs backend functionality.

## Requirements

### 1. Room Management
- Create room → returns 6-character alphanumeric code
- Join room by code → validates room exists, not full
- Leave room → cleanup player from room
- Max 8 players per room

### 2. Supabase Realtime Integration
- Use Supabase Realtime for presence (who's in room)
- Broadcast game state changes to all players
- Handle player disconnection gracefully

### 3. Game State Sync
- Host selects settings (difficulty, rounds)
- All players see same questions in same order
- Scores sync in real-time
- Round transitions are synchronized

## Files to Reference

- `src/hooks/useMultiplayerGame.ts` - Existing hook (needs backend calls)
- `src/lib/multiplayer.ts` - Multiplayer utilities
- `supabase/multiplayer.sql` - Table schema
- `src/app/play/multi/[code]/page.tsx` - Room page

## Constraints

- Use existing Supabase client from `src/lib/supabase.ts`
- Follow patterns in `src/lib/questions.ts` for error handling
- Add timeout handling like in `supabaseQuestions.ts`

## Acceptance Criteria

- [ ] `createRoom()` returns room code
- [ ] `joinRoom(code)` validates and joins
- [ ] `leaveRoom()` cleans up properly
- [ ] Realtime presence shows connected players
- [ ] Game state broadcasts to all players
- [ ] Works when Supabase is slow (timeout + graceful fail)

## Handoff Notes

When done, hand off to GEMINI for:
- Polish the lobby UI with player avatars
- Add animations for player join/leave
- Victory/results screen for multiplayer
