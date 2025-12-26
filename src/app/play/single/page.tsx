// Wiki Guesser - Single Player Game Page

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, Suspense, useRef } from 'react';
import { useGame } from '@/hooks/useGame';
import { useSaveGame } from '@/hooks/useSaveGame';
import { useAuth } from '@/contexts/AuthContext';
import { GameBoard } from '@/components/game/GameBoard';
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

    if (isLoading || state.phase === 'selecting') {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading your Wikipedia adventure...</p>
            </div>
        );
    }

    // Get last round info for between-rounds phase
    const lastRound = state.currentRound >= 0 && state.rounds[state.currentRound]
        ? {
            isCorrect: state.rounds[state.currentRound].isCorrect ?? false,
            guess: state.rounds[state.currentRound].guess,
            pointsEarned: state.rounds[state.currentRound].pointsEarned,
        }
        : null;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>Wiki<span>Guesser</span></Link>
            </header>

            <main className={styles.main}>
                <GameBoard
                    topic={currentTopic}
                    options={state.rounds[state.currentRound]?.options || []}
                    difficulty={state.difficulty}
                    phase={state.phase as 'playing' | 'between-rounds' | 'finished'}
                    currentRound={state.currentRound}
                    totalRounds={state.totalRounds}
                    score={state.score}
                    streak={state.streak}
                    timeRemaining={timeRemaining}
                    lastRound={lastRound}
                    scoreBreakdown={lastScoreBreakdown}
                    onSubmitGuess={submitGuess}
                    onNextRound={nextRound}
                    onPlayAgain={resetGame}
                    longestStreak={state.longestStreak}
                    category={state.rounds[state.currentRound]?.category}
                    categoryData={state.rounds[state.currentRound]?.categoryData}
                    correctAnswer={state.rounds[state.currentRound]?.correctAnswer}
                    rounds={state.rounds}
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
