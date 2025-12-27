// Wiki Guesser - Multiplayer Game Hook

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import {
    GameRoom,
    RoomPlayer,
    RoomQuestion,
    getRoomByCode,
    getRoomPlayers,
    getCurrentQuestion,
    submitAnswer,
    toggleReady,
    startGame,
    nextRound,
    leaveRoom,
    joinRoom,
    getRoomQuestions,
} from '@/lib/multiplayer';

interface MultiplayerGameState {
    room: GameRoom | null;
    players: RoomPlayer[];
    currentQuestion: RoomQuestion | null;
    phase: 'loading' | 'lobby' | 'countdown' | 'playing' | 'results' | 'finished';
    timeRemaining: number;
    roundStartTime: number | null;
    hasAnswered: boolean;
    lastAnswer: { points: number; isCorrect: boolean } | null;
    blitzQuestions: RoomQuestion[];
    blitzIndex: number;
}

interface UseMultiplayerGameProps {
    roomCode: string;
    userId: string;
    username: string; // Added username
}

export function useMultiplayerGame({ roomCode, userId, username }: UseMultiplayerGameProps) {
    const [state, setState] = useState<MultiplayerGameState>({
        // ... (existing initial state)
        room: null,
        players: [],
        currentQuestion: null,
        phase: 'loading',
        timeRemaining: 0,
        roundStartTime: null,
        hasAnswered: false,
        lastAnswer: null,
        blitzQuestions: [],
        blitzIndex: 0,
    });

    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const supabase = getSupabaseClient();
    const roomId = state.room?.id;
    const joiningRef = useRef(false); // Prevent double joins

    // Fetch initial room state
    const fetchRoomState = useCallback(async () => {
        if (!roomCode || !userId || !username) return;

        const room = await getRoomByCode(roomCode);
        if (!room) {
            setError('Room not found');
            return;
        }

        let players = await getRoomPlayers(room.id);

        // Check if I am in the list
        const amIInList = players.some(p => p.user_id === userId);

        if (!amIInList && !joiningRef.current && room.status === 'lobby') {
            // Auto-join
            joiningRef.current = true;
            console.log('[useMultiplayerGame] Auto-joining room...');

            const joinResult = await joinRoom(room.code, userId, username);

            if (joinResult.error) {
                console.error('[useMultiplayerGame] Auto-join failed:', joinResult.error);
                setError(joinResult.error);
                joiningRef.current = false;
                return;
            }

            // Refetch players
            players = await getRoomPlayers(room.id);
            joiningRef.current = false;
        } else if (!amIInList && room.status !== 'lobby') {
            setError('Game already in progress');
            return;
        }

        let question: RoomQuestion | null = null;
        let blitzQuestions: RoomQuestion[] = [];
        let blitzIndex = 0;

        if (room.mode === 'blitz' && room.status === 'playing') {
            // Blitz: Fetch all questions
            blitzQuestions = await getRoomQuestions(room.id);

            // Calculate my progress
            const myAnswers = await supabase
                .from('room_answers')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id)
                .eq('user_id', userId);

            blitzIndex = myAnswers.count || 0;
            question = blitzQuestions[blitzIndex] || null;

        } else if (room.status === 'playing' && room.current_round > 0) {
            // Standard: Fetch current question
            question = await getCurrentQuestion(room.id, room.current_round);
        }

        setState(prev => ({
            ...prev,
            room,
            players,
            currentQuestion: question,
            blitzQuestions,
            blitzIndex,
            phase: room.status === 'lobby' ? 'lobby' :
                room.status === 'finished' ? 'finished' :
                    (room.mode === 'blitz' && blitzIndex >= 5) ? 'results' : 'playing',
        }));
    }, [roomCode, userId, username]);

    // Initial load
    useEffect(() => {
        fetchRoomState();
    }, [fetchRoomState]);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!roomId) return;

        const roomChannel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
                (payload) => {
                    const newRoom = payload.new as GameRoom;
                    setState(prev => {
                        // Detect round change
                        if (newRoom.current_round !== prev.room?.current_round && newRoom.status === 'playing') {
                            // New round starting
                            getCurrentQuestion(newRoom.id, newRoom.current_round).then(q => {
                                setState(p => ({
                                    ...p,
                                    currentQuestion: q,
                                    phase: 'countdown',
                                    hasAnswered: false,
                                    lastAnswer: null,
                                    roundStartTime: null,
                                }));

                                // Start countdown
                                setTimeout(() => {
                                    setState(p => ({
                                        ...p,
                                        phase: 'playing',
                                        roundStartTime: Date.now(),
                                        timeRemaining: newRoom.time_per_round * 1000,
                                    }));
                                }, 3000);
                            });
                        }

                        return {
                            ...prev,
                            room: newRoom,
                            phase: newRoom.status === 'finished' ? 'finished' : prev.phase,
                        };
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
                () => {
                    // Refresh players list
                    getRoomPlayers(roomId!).then(players => {
                        setState(prev => ({ ...prev, players }));
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'room_answers', filter: `room_id=eq.${roomId}` },
                () => {
                    // Someone answered - could show "X answered!" notification
                    getRoomPlayers(roomId!).then(players => {
                        setState(prev => ({ ...prev, players }));
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(roomChannel);
        };
    }, [roomId, supabase]);

    // Timer effect
    useEffect(() => {
        if (state.phase !== 'playing' || !state.roundStartTime) {
            return;
        }

        const timeLimit = (state.room?.time_per_round || 30) * 1000;

        const updateTimer = () => {
            const elapsed = Date.now() - state.roundStartTime!;
            const remaining = Math.max(0, timeLimit - elapsed);
            setState(prev => ({ ...prev, timeRemaining: remaining }));

            if (remaining <= 0) {
                // Time's up - show results
                setState(prev => ({ ...prev, phase: 'results' }));
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 100);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [state.phase, state.roundStartTime, state.room?.time_per_round]);

    // Actions
    const setReady = useCallback(async (ready: boolean) => {
        if (!roomId) return;
        await toggleReady(roomId, userId, ready);
    }, [roomId, userId]);

    const startGameAction = useCallback(async () => {
        if (!roomId) return { success: false, error: 'No room' };
        return await startGame(roomId, userId);
    }, [roomId, userId]);

    const answer = useCallback(async (answerText: string) => {
        if (!state.room?.id || !state.currentQuestion || state.hasAnswered) return;

        // Use global timer for Blitz, relative for Standard?
        // Actually for Blitz, points might depend on speed too?
        // For now use same 30s logic or just raw time.
        // Blitz time limit is different (120s). 
        // Speed bonus logic in backend relies on 30s.
        // We might want to adjust backend scoring for Blitz later. For now, keep as is.
        const timeMs = state.roundStartTime ? Date.now() - state.roundStartTime : 30000;

        const isBlitz = state.room.mode === 'blitz';
        const roundNum = isBlitz ? state.blitzIndex + 1 : state.room.current_round;

        const result = await submitAnswer(
            state.room.id,
            userId,
            roundNum,
            answerText,
            timeMs,
            state.currentQuestion.correct_answer
        );

        setState(prev => ({
            ...prev,
            hasAnswered: true,
            lastAnswer: result,
        }));

        if (isBlitz) {
            // Auto-advance after 1.5s
            setTimeout(() => {
                setState(prev => {
                    const nextIndex = prev.blitzIndex + 1;
                    const nextQ = prev.blitzQuestions[nextIndex] || null;
                    const isFinished = !nextQ && nextIndex >= 5;

                    return {
                        ...prev,
                        hasAnswered: false,
                        lastAnswer: null, // Clear result to show next question
                        blitzIndex: nextIndex,
                        currentQuestion: nextQ,
                        phase: isFinished ? 'results' : 'playing'
                    };
                });
            }, 1500);
        }
    }, [state.room, state.currentQuestion, state.hasAnswered, state.roundStartTime, state.blitzIndex, state.blitzQuestions, userId]);

    const advanceRound = useCallback(async () => {
        if (!roomId) return;

        const { finished } = await nextRound(roomId);

        if (finished) {
            setState(prev => ({ ...prev, phase: 'finished' }));
        }
    }, [roomId]);

    const leave = useCallback(async () => {
        if (!roomId) return;
        await leaveRoom(roomId, userId);
    }, [roomId, userId]);

    const isHost = state.players.find(p => p.user_id === userId)?.is_host || false;
    const myPlayer = state.players.find(p => p.user_id === userId);

    return {
        ...state,
        error,
        isHost,
        myPlayer,
        setReady,
        startGame: startGameAction,
        answer,
        advanceRound,
        leave,
        refresh: fetchRoomState,
    };
}
