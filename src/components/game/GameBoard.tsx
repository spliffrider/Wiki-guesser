// Wiki Guesser - Main Game Board Component

'use client';

import { WikiTopic, Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { redactExcerpt } from '@/lib/wikipedia';
import { Timer } from './Timer';
import { GuessInput } from './GuessInput';
import { ScoreDisplay } from './ScoreDisplay';
import { RoundResult } from './RoundResult';
import styles from './GameBoard.module.css';

interface GameBoardProps {
    topic: WikiTopic | null;
    difficulty: Difficulty;
    phase: 'playing' | 'between-rounds' | 'finished';
    currentRound: number;
    totalRounds: number;
    score: number;
    streak: number;
    timeRemaining: number;
    lastRound: {
        isCorrect: boolean;
        guess: string | null;
        pointsEarned: number;
    } | null;
    scoreBreakdown: {
        basePoints: number;
        timeBonus: number;
        streakMultiplier: number;
        difficultyMultiplier: number;
        totalPoints: number;
    } | null;
    onSubmitGuess: (guess: string) => void;
    onNextRound: () => void;
    onPlayAgain: () => void;
    longestStreak: number;
}

export function GameBoard({
    topic,
    difficulty,
    phase,
    currentRound,
    totalRounds,
    score,
    streak,
    timeRemaining,
    lastRound,
    scoreBreakdown,
    onSubmitGuess,
    onNextRound,
    onPlayAgain,
    longestStreak,
}: GameBoardProps) {
    const config = DIFFICULTY_CONFIG[difficulty];

    if (phase === 'finished') {
        return (
            <div className={styles.finishedContainer}>
                <div className={styles.finishedCard}>
                    <h1 className={styles.finishedTitle}>Game Over!</h1>

                    <div className={styles.finalScore}>
                        <span className={styles.finalScoreLabel}>Final Score</span>
                        <span className={styles.finalScoreValue}>{score.toLocaleString()}</span>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{totalRounds}</span>
                            <span className={styles.statLabel}>Rounds</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{longestStreak}</span>
                            <span className={styles.statLabel}>Best Streak</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{difficulty}</span>
                            <span className={styles.statLabel}>Difficulty</span>
                        </div>
                    </div>

                    <button onClick={onPlayAgain} className={styles.playAgainButton}>
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'between-rounds' && lastRound && topic) {
        return (
            <div className={styles.container}>
                <ScoreDisplay
                    score={score}
                    streak={streak}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                />
                <RoundResult
                    isCorrect={lastRound.isCorrect}
                    topic={topic}
                    guess={lastRound.guess}
                    pointsEarned={lastRound.pointsEarned}
                    scoreBreakdown={scoreBreakdown}
                    onContinue={onNextRound}
                    isLastRound={currentRound + 1 >= totalRounds}
                />
            </div>
        );
    }

    if (!topic) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading topic...</p>
            </div>
        );
    }

    // Determine what content to show based on difficulty
    const showImage = config.showImage && topic.imageUrl;
    const showExcerpt = config.showExcerpt;
    const showCategories = config.showCategories;

    // ALWAYS redact the answer from excerpts to prevent giving away the answer
    // Expert mode shows redaction bars, other modes just remove the words
    const rawExcerpt = topic.excerpt.slice(0, config.excerptLength);
    const displayExcerpt = redactExcerpt(rawExcerpt, topic.title);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ScoreDisplay
                    score={score}
                    streak={streak}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                />
                <div className={styles.timerWrapper}>
                    <Timer
                        timeRemaining={timeRemaining}
                        timeLimit={config.timeLimit}
                    />
                </div>
            </div>

            <div className={styles.topicCard}>
                <div className={styles.difficultyBadge}>
                    {difficulty.toUpperCase()}
                </div>

                <h2 className={styles.promptText}>What is this Wikipedia article about?</h2>

                <div className={styles.topicContent}>
                    {showImage && (
                        <div className={styles.imageContainer}>
                            <img
                                src={topic.imageUrl as string}
                                alt="Topic hint"
                                className={styles.topicImage}
                            />
                        </div>
                    )}

                    {showExcerpt && displayExcerpt && (
                        <div className={styles.excerptContainer}>
                            <p className={styles.excerpt}>{displayExcerpt}</p>
                        </div>
                    )}

                    {showCategories && topic.categories.length > 0 && (
                        <div className={styles.categories}>
                            <span className={styles.categoryLabel}>Categories:</span>
                            {topic.categories.map((cat, i) => (
                                <span key={i} className={styles.categoryTag}>{cat}</span>
                            ))}
                        </div>
                    )}

                    {!showImage && !showExcerpt && (
                        <div className={styles.noHints}>
                            <span className={styles.noHintsEmoji}>🤔</span>
                            <p>Expert mode: No hints available!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.inputSection}>
                <GuessInput onSubmit={onSubmitGuess} />
            </div>
        </div>
    );
}
