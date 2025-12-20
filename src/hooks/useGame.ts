// Wiki Guesser - Game State Management Hook

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    GameState,
    GamePhase,
    Difficulty,
    Round,
    WikiTopic,
    DIFFICULTY_CONFIG
} from '@/types';
import { getRandomTopics, checkAnswer } from '@/lib/wikipedia';
import { calculateScore } from '@/lib/scoring';

const DEFAULT_TOTAL_ROUNDS = 5;

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

interface UseGameReturn {
    state: GameState;
    isLoading: boolean;
    error: string | null;
    startGame: (difficulty: Difficulty) => Promise<void>;
    submitGuess: (guess: string) => void;
    nextRound: () => void;
    resetGame: () => void;
    currentTopic: WikiTopic | null;
    timeRemaining: number;
    lastScoreBreakdown: ReturnType<typeof calculateScore> | null;
}

export function useGame(): UseGameReturn {
    const [state, setState] = useState<GameState>({
        difficulty: 'easy',
        phase: 'selecting',
        currentRound: 0,
        totalRounds: DEFAULT_TOTAL_ROUNDS,
        rounds: [],
        score: 0,
        streak: 0,
        longestStreak: 0,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [lastScoreBreakdown, setLastScoreBreakdown] = useState<ReturnType<typeof calculateScore> | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const roundStartTimeRef = useRef<number | null>(null);

    // Get current topic
    const currentTopic = state.rounds[state.currentRound]?.topic ?? null;

    // Timer effect
    useEffect(() => {
        if (state.phase !== 'playing' || !roundStartTimeRef.current) {
            return;
        }

        const timeLimit = DIFFICULTY_CONFIG[state.difficulty].timeLimit * 1000;

        const updateTimer = () => {
            const elapsed = Date.now() - roundStartTimeRef.current!;
            const remaining = Math.max(0, timeLimit - elapsed);
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                // Time's up - count as wrong answer
                handleTimeUp();
            }
        };

        // Update immediately and then every 100ms
        updateTimer();
        timerRef.current = setInterval(updateTimer, 100);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [state.phase, state.currentRound]);

    const handleTimeUp = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setState(prev => {
            const updatedRounds = [...prev.rounds];
            updatedRounds[prev.currentRound] = {
                ...updatedRounds[prev.currentRound],
                endedAt: Date.now(),
                guess: null,
                isCorrect: false,
                timeTakenMs: DIFFICULTY_CONFIG[prev.difficulty].timeLimit * 1000,
                pointsEarned: 0,
            };

            return {
                ...prev,
                phase: 'between-rounds',
                rounds: updatedRounds,
                streak: 0, // Reset streak on time out
            };
        });

        setLastScoreBreakdown(null);
    }, []);

    const startGame = useCallback(async (difficulty: Difficulty) => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch extra topics for wrong answer options (4 options per round = 3 wrong per round)
            const totalTopicsNeeded = DEFAULT_TOTAL_ROUNDS * 4; // 4 options per round
            const topics = await getRandomTopics(totalTopicsNeeded + 5); // extra buffer

            if (topics.length < totalTopicsNeeded) {
                throw new Error('Could not fetch enough topics. Please try again.');
            }

            // Split topics: first N for correct answers, rest for wrong options pool
            const correctTopics = topics.slice(0, DEFAULT_TOTAL_ROUNDS);
            const wrongOptionsPool = topics.slice(DEFAULT_TOTAL_ROUNDS);

            // Create rounds with shuffled options
            const rounds: Round[] = correctTopics.map((topic, index) => {
                // Get 3 wrong options from the pool (unique per round)
                const wrongStartIndex = index * 3;
                const wrongOptions = wrongOptionsPool
                    .slice(wrongStartIndex, wrongStartIndex + 3)
                    .map(t => t.title);

                // Combine correct + wrong and shuffle
                const allOptions = [topic.title, ...wrongOptions];
                const shuffledOptions = shuffleArray(allOptions);

                return {
                    roundNumber: index + 1,
                    topic,
                    options: shuffledOptions,
                    timeLimit: DIFFICULTY_CONFIG[difficulty].timeLimit,
                    startedAt: null,
                    endedAt: null,
                    guess: null,
                    isCorrect: null,
                    timeTakenMs: null,
                    pointsEarned: 0,
                };
            });

            // Start first round
            roundStartTimeRef.current = Date.now();
            rounds[0].startedAt = roundStartTimeRef.current;

            setState({
                difficulty,
                phase: 'playing',
                currentRound: 0,
                totalRounds: DEFAULT_TOTAL_ROUNDS,
                rounds,
                score: 0,
                streak: 0,
                longestStreak: 0,
            });

            setTimeRemaining(DIFFICULTY_CONFIG[difficulty].timeLimit * 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start game');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const submitGuess = useCallback((guess: string) => {
        if (state.phase !== 'playing' || !currentTopic) {
            return;
        }

        // Stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const endTime = Date.now();
        const timeTaken = roundStartTimeRef.current
            ? endTime - roundStartTimeRef.current
            : 0;

        const isCorrect = checkAnswer(guess, currentTopic.title);

        let pointsEarned = 0;
        let newStreak = state.streak;
        let breakdown: ReturnType<typeof calculateScore> | null = null;

        if (isCorrect) {
            newStreak = state.streak + 1;
            breakdown = calculateScore(
                timeTaken,
                DIFFICULTY_CONFIG[state.difficulty].timeLimit,
                state.streak, // Use previous streak for multiplier calculation
                state.difficulty
            );
            pointsEarned = breakdown.totalPoints;
        } else {
            newStreak = 0;
        }

        setLastScoreBreakdown(breakdown);

        setState(prev => {
            const updatedRounds = [...prev.rounds];
            updatedRounds[prev.currentRound] = {
                ...updatedRounds[prev.currentRound],
                endedAt: endTime,
                guess,
                isCorrect,
                timeTakenMs: timeTaken,
                pointsEarned,
            };

            return {
                ...prev,
                phase: 'between-rounds',
                rounds: updatedRounds,
                score: prev.score + pointsEarned,
                streak: newStreak,
                longestStreak: Math.max(prev.longestStreak, newStreak),
            };
        });
    }, [state.phase, state.streak, state.difficulty, currentTopic]);

    const nextRound = useCallback(() => {
        const nextRoundIndex = state.currentRound + 1;

        if (nextRoundIndex >= state.totalRounds) {
            // Game finished
            setState(prev => ({
                ...prev,
                phase: 'finished',
            }));
            return;
        }

        // Start next round
        roundStartTimeRef.current = Date.now();

        setState(prev => {
            const updatedRounds = [...prev.rounds];
            updatedRounds[nextRoundIndex] = {
                ...updatedRounds[nextRoundIndex],
                startedAt: roundStartTimeRef.current,
            };

            return {
                ...prev,
                phase: 'playing',
                currentRound: nextRoundIndex,
                rounds: updatedRounds,
            };
        });

        setTimeRemaining(DIFFICULTY_CONFIG[state.difficulty].timeLimit * 1000);
        setLastScoreBreakdown(null);
    }, [state.currentRound, state.totalRounds, state.difficulty]);

    const resetGame = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        roundStartTimeRef.current = null;

        setState({
            difficulty: 'easy',
            phase: 'selecting',
            currentRound: 0,
            totalRounds: DEFAULT_TOTAL_ROUNDS,
            rounds: [],
            score: 0,
            streak: 0,
            longestStreak: 0,
        });

        setTimeRemaining(0);
        setLastScoreBreakdown(null);
        setError(null);
    }, []);

    return {
        state,
        isLoading,
        error,
        startGame,
        submitGuess,
        nextRound,
        resetGame,
        currentTopic,
        timeRemaining,
        lastScoreBreakdown,
    };
}
