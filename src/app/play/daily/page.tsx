'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/contexts/AuthContext';
import { LibraryGameBoard } from '@/components/library/LibraryGameBoard';
import { LibraryGameResult } from '@/components/library/LibraryGameResult';
import { getDailySeed } from '@/lib/random';
import { calculateLevel } from '@/lib/levels';
import { Difficulty } from '@/types';

export default function DailyChallengePage() {
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
    } = useGame();

    const { profile } = useAuth();
    const hasStartedRef = useRef(false);

    // Daily Challenge settings
    const DAILY_DIFFICULTY: Difficulty = 'medium';
    const dailySeed = getDailySeed();

    // Start game on mount with daily seed
    useEffect(() => {
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            // Calculate user level or default to 1
            const userLevel = profile ? calculateLevel(profile.total_score) : 1;

            console.log(`Starting Daily Challenge for ${dailySeed}`);
            startGame(DAILY_DIFFICULTY, userLevel, dailySeed);
        }
    }, [startGame, profile, dailySeed]);

    // Handle "Play Again" - for Daily, it might just restart the same seed or show a message
    // For now, let's allow replaying the same seed (practice)
    const handlePlayAgain = () => {
        const userLevel = profile ? calculateLevel(profile.total_score) : 1;
        startGame(DAILY_DIFFICULTY, userLevel, dailySeed);
    };

    if (error) {
        return (
            <div className="library-page w-full min-h-screen flex items-center justify-center p-4">
                <div className="bg-[#fcfbf9] text-[#2b1d1f] p-8 rounded-xl border-2 border-[#5d4037] shadow-xl max-w-md w-full text-center">
                    <h2 className="font-display font-bold text-2xl mb-4 text-[#8d6e63]">Connection Severed</h2>
                    <p className="mb-6">{error}</p>
                    <button
                        onClick={handlePlayAgain}
                        className="px-6 py-3 bg-[#5d4037] text-[#f0e6d2] rounded font-bold hover:bg-[#4e342e] transition-colors"
                    >
                        Reconnect
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="block w-full mt-4 text-[#5d4037] hover:underline"
                    >
                        Return to Archives
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
                    <p className="font-display tracking-widest uppercase text-sm">Validating Daily Clearance...</p>
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
            correctAnswer: state.rounds[state.currentRound].correctAnswer,
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
                        onPlayAgain={handlePlayAgain}
                        onHome={() => window.location.href = '/'}
                        title="Daily Report Filed"
                        subtitle={`Completion for ${dailySeed}`}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="library-page w-full min-h-screen">
            <main className="library-container relative">
                {/* Daily Badge Overlay */}
                <div className="absolute top-4 right-4 z-10 pointer-events-none opacity-80">
                    <div className="bg-[#5d4037] text-[#f0e6d2] px-3 py-1 rounded text-xs font-bold uppercase tracking-widest shadow-md border border-[#8d6e63]">
                        Daily {dailySeed}
                    </div>
                </div>

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
