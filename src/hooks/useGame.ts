// Wiki Guesser - Game State Management Hook

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    GameState,
    GamePhase,
    Difficulty,
    Round,
    WikiTopic,
    DIFFICULTY_CONFIG,
    QuestionCategory,
    CategoryData,
    OddWikiOutData,
    WhenInWikiData,
    WikiOrFictionData,
    WikiLinksData,
} from '@/types';
import { checkAnswer } from '@/lib/wikipedia';
import { calculateScore } from '@/lib/scoring';
import { calculateLevel } from '@/lib/levels';
import {
    getRandomCategory,
    getRandomOddWikiOut,
    getRandomWhenInWiki,
    getRandomWikiOrFiction,
    getRandomWikiLinks,
    getRandomWikiWhat,
} from '@/lib/questions';

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

// Create a placeholder WikiTopic for non-wiki_what categories
function createPlaceholderTopic(title: string, pageUrl?: string): WikiTopic {
    return {
        id: `placeholder-${Date.now()}`,
        title,
        excerpt: '',
        imageUrl: null,
        categories: [],
        pageUrl: pageUrl || '',
    };
}

interface UseGameReturn {
    state: GameState;
    isLoading: boolean;
    error: string | null;
    startGame: (difficulty: Difficulty, userLevel?: number) => Promise<void>;
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

    const startGame = useCallback(async (difficulty: Difficulty, userLevel?: number) => {
        setIsLoading(true);
        setError(null);

        try {
            // Generate a random category for each round
            const roundCategories: QuestionCategory[] = [];
            for (let i = 0; i < DEFAULT_TOTAL_ROUNDS; i++) {
                roundCategories.push(getRandomCategory());
            }

            // Count how many of each category we need
            const wikiWhatCount = roundCategories.filter(c => c === 'wiki_what').length;
            const oddWikiOutCount = roundCategories.filter(c => c === 'odd_wiki_out').length;
            const whenInWikiCount = roundCategories.filter(c => c === 'when_in_wiki').length;
            const wikiOrFictionCount = roundCategories.filter(c => c === 'wiki_or_fiction').length;
            const wikiLinksCount = roundCategories.filter(c => c === 'wiki_links').length;

            // Fetch all questions from Supabase in parallel (fast!)
            const [wikiWhatRoundData, oddWikiOutQuestions, whenInWikiQuestions, wikiOrFictionQuestions, wikiLinksQuestions] = await Promise.all([
                getRandomWikiWhat(wikiWhatCount),
                getRandomOddWikiOut(oddWikiOutCount),
                getRandomWhenInWiki(whenInWikiCount),
                getRandomWikiOrFiction(wikiOrFictionCount),
                getRandomWikiLinks(wikiLinksCount),
            ]);

            // Track indices for each category
            let wikiWhatIndex = 0;
            let oddWikiOutIndex = 0;
            let whenInWikiIndex = 0;
            let wikiOrFictionIndex = 0;
            let wikiLinksIndex = 0;

            // Create rounds with category-specific data
            const rounds: Round[] = roundCategories.map((category, index) => {
                const baseRound = {
                    roundNumber: index + 1,
                    timeLimit: DIFFICULTY_CONFIG[difficulty].timeLimit,
                    startedAt: null as number | null,
                    endedAt: null as number | null,
                    guess: null as string | null,
                    isCorrect: null as boolean | null,
                    timeTakenMs: null as number | null,
                    pointsEarned: 0,
                };

                switch (category) {
                    case 'wiki_what': {
                        const roundData = wikiWhatRoundData[wikiWhatIndex];
                        const allOptions = [roundData.topic.title, ...roundData.wrongOptions];
                        wikiWhatIndex++;

                        return {
                            ...baseRound,
                            category: 'wiki_what' as QuestionCategory,
                            topic: roundData.topic,
                            options: shuffleArray(allOptions),
                            correctAnswer: roundData.topic.title,
                        };
                    }

                    case 'odd_wiki_out': {
                        const data = oddWikiOutQuestions[oddWikiOutIndex];
                        oddWikiOutIndex++;
                        // The options are the items themselves
                        return {
                            ...baseRound,
                            category: 'odd_wiki_out' as QuestionCategory,
                            topic: createPlaceholderTopic('Odd Wiki Out', data.source),
                            options: data.items,
                            correctAnswer: data.items[data.impostorIndex],
                            categoryData: data as CategoryData,
                        };
                    }

                    case 'when_in_wiki': {
                        const data = whenInWikiQuestions[whenInWikiIndex];
                        whenInWikiIndex++;
                        return {
                            ...baseRound,
                            category: 'when_in_wiki' as QuestionCategory,
                            topic: createPlaceholderTopic('When in Wiki?', data.source),
                            options: data.yearOptions.map(y => y.toString()),
                            correctAnswer: data.correctYear.toString(),
                            categoryData: data as CategoryData,
                        };
                    }

                    case 'wiki_or_fiction': {
                        const data = wikiOrFictionQuestions[wikiOrFictionIndex];
                        wikiOrFictionIndex++;
                        return {
                            ...baseRound,
                            category: 'wiki_or_fiction' as QuestionCategory,
                            topic: createPlaceholderTopic('Wiki or Fiction?', data.source),
                            options: ['TRUE', 'FALSE'],
                            correctAnswer: data.isTrue ? 'TRUE' : 'FALSE',
                            categoryData: data as CategoryData,
                        };
                    }

                    case 'wiki_links': {
                        const data = wikiLinksQuestions[wikiLinksIndex];
                        wikiLinksIndex++;
                        // Use the connection options as multiple choice
                        const options = data.connectionOptions || [data.connection];
                        return {
                            ...baseRound,
                            category: 'wiki_links' as QuestionCategory,
                            topic: createPlaceholderTopic('Wiki Links', data.source),
                            options: shuffleArray(options),
                            correctAnswer: data.connection,
                            categoryData: data as CategoryData,
                        };
                    }

                    default:
                        throw new Error(`Unknown category: ${category}`);
                }
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
        const currentRound = state.rounds[state.currentRound];
        if (state.phase !== 'playing' || !currentRound) {
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

        // Use correctAnswer from round for all categories
        // For wiki_what, use fuzzy matching; for others, use exact match
        const isCorrect = currentRound.category === 'wiki_what'
            ? checkAnswer(guess, currentRound.correctAnswer)
            : guess === currentRound.correctAnswer;

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
