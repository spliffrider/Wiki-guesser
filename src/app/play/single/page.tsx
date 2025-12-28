// Wiki Guesser - Single Player Game Page

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, Suspense, useRef } from 'react';
import { useGame } from '@/hooks/useGame';
import { useSaveGame } from '@/hooks/useSaveGame';
import { useAuth } from '@/contexts/AuthContext';
import { GameBoard } from '@/components/game/GameBoard'; // Keeping for reference if needed, or remove?
import { LibraryGameBoard } from '@/components/library/LibraryGameBoard';
import { LibraryGameResult } from '@/components/library/LibraryGameResult';
import { Difficulty } from '@/types';
import { calculateLevel } from '@/lib/levels';
import styles from './page.module.css';

function SinglePlayerGame() {
    const searchParams = useSearchParams();
    const difficultyParam = searchParams.get('difficulty') as Difficulty | null;
    const difficulty = difficultyParam || 'easy';
    const hasSavedRef = useRef(false);

    const { profile } = useAuth();

    const {
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
    } = useGame();

    const { saveGameIfLoggedIn } = useSaveGame();

    // Calculate user level from total score (XP)
    const userLevel = profile ? calculateLevel(profile.total_score) : 1;

    // Start game on mount
    useEffect(() => {
        if (state.phase === 'selecting') {
            startGame(difficulty, userLevel);
            hasSavedRef.current = false;
        }
    }, [difficulty, state.phase, startGame, userLevel]);

    // Save game when finished
    useEffect(() => {
        if (state.phase === 'finished' && !hasSavedRef.current) {
            hasSavedRef.current = true;
            const correctCount = state.rounds.filter(r => r.isCorrect).length;
            saveGameIfLoggedIn(
                state.difficulty,
                state.score,
                state.totalRounds,
                correctCount,
                state.longestStreak
            );
        }
    }, [state.phase, state.difficulty, state.score, state.totalRounds, state.rounds, state.longestStreak, saveGameIfLoggedIn]);

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorCard}>
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={() => startGame(difficulty)} className={styles.retryButton}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || state.phase === 'selecting' || !currentTopic) {
        return (
            <div className="library-page w-full min-h-screen flex items-center justify-center">
                <div className="text-amber-100 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-display tracking-widest uppercase text-sm">Consulting the Archives...</p>
                </div>
            </div>
        );
    }

    // Get last round info for between-rounds phase
    const lastRound = state.currentRound >= 0 && state.rounds[state.currentRound]
        ? {
            isCorrect: state.rounds[state.currentRound].isCorrect ?? false,
            guess: state.rounds[state.currentRound].guess,
            pointsEarned: state.rounds[state.currentRound].pointsEarned,
            // SECURITY: Only pass correct answer during between-rounds phase to prevent cheating
            correctAnswer: state.phase === 'between-rounds' ? state.rounds[state.currentRound].correctAnswer : '',
        }
        : null;

    if (state.phase === 'finished') {
        return (
            <div className="library-page w-full min-h-screen">
                <main className="library-container">
                    <LibraryGameResult
                        topic={currentTopic}
                        score={state.score}
                        totalRounds={state.totalRounds}
                        longestStreak={state.longestStreak}
                        difficulty={state.difficulty}
                        onPlayAgain={resetGame}
                        onHome={() => window.location.href = '/'}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="library-page w-full min-h-screen">
            <main className="library-container">
                <LibraryGameBoard
                    topic={currentTopic!}
                    options={state.rounds[state.currentRound]?.options || []}
                    difficulty={state.difficulty}
                    currentRound={state.currentRound + 1}
                    totalRounds={state.totalRounds}
                    score={state.score}
                    streak={state.streak}
                    timeRemaining={timeRemaining}
                    onSubmitGuess={submitGuess}
                    phase={state.phase as 'playing' | 'between-rounds'}
                    lastRound={lastRound}
                    onNextRound={nextRound}
                    category={state.rounds[state.currentRound]?.category}
                    categoryData={state.rounds[state.currentRound]?.categoryData}
                />
            </main>
        </div>
    );
}

export default function SinglePlayerPage() {
    return (
        <Suspense fallback={
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        }>
            <SinglePlayerGame />
        </Suspense>
    );
}
