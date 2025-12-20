// Wiki Guesser - Round Result Component

'use client';

import { WikiTopic } from '@/types';
import { formatScore } from '@/lib/scoring';
import styles from './RoundResult.module.css';

interface RoundResultProps {
    isCorrect: boolean;
    topic: WikiTopic;
    guess: string | null;
    pointsEarned: number;
    scoreBreakdown: {
        basePoints: number;
        timeBonus: number;
        streakMultiplier: number;
        difficultyMultiplier: number;
        totalPoints: number;
    } | null;
    onContinue: () => void;
    isLastRound: boolean;
}

export function RoundResult({
    isCorrect,
    topic,
    guess,
    pointsEarned,
    scoreBreakdown,
    onContinue,
    isLastRound,
}: RoundResultProps) {
    return (
        <div className={`${styles.container} ${isCorrect ? styles.correct : styles.incorrect}`}>
            <div className={styles.resultHeader}>
                <span className={styles.resultEmoji}>
                    {isCorrect ? '🎉' : '😔'}
                </span>
                <h2 className={styles.resultTitle}>
                    {isCorrect ? 'Correct!' : 'Not quite...'}
                </h2>
            </div>

            <div className={styles.answerReveal}>
                <span className={styles.answerLabel}>The answer was:</span>
                <h3 className={styles.answer}>{topic.title}</h3>
                {topic.excerpt && (
                    <p className={styles.excerpt}>{topic.excerpt.slice(0, 200)}...</p>
                )}
                <a
                    href={topic.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.wikiLink}
                >
                    Read on Wikipedia →
                </a>
            </div>

            {isCorrect && scoreBreakdown && (
                <div className={styles.scoreBreakdown}>
                    <div className={styles.breakdownRow}>
                        <span>Base points</span>
                        <span>+{scoreBreakdown.basePoints}</span>
                    </div>
                    <div className={styles.breakdownRow}>
                        <span>Time bonus</span>
                        <span>+{scoreBreakdown.timeBonus}</span>
                    </div>
                    {scoreBreakdown.streakMultiplier > 1 && (
                        <div className={styles.breakdownRow}>
                            <span>Streak bonus</span>
                            <span>×{scoreBreakdown.streakMultiplier.toFixed(2)}</span>
                        </div>
                    )}
                    {scoreBreakdown.difficultyMultiplier > 1 && (
                        <div className={styles.breakdownRow}>
                            <span>Difficulty bonus</span>
                            <span>×{scoreBreakdown.difficultyMultiplier.toFixed(1)}</span>
                        </div>
                    )}
                    <div className={`${styles.breakdownRow} ${styles.total}`}>
                        <span>Total</span>
                        <span className={styles.totalPoints}>+{formatScore(pointsEarned)}</span>
                    </div>
                </div>
            )}

            {!isCorrect && guess && (
                <div className={styles.yourGuess}>
                    <span className={styles.guessLabel}>Your guess:</span>
                    <span className={styles.guess}>{guess}</span>
                </div>
            )}

            <button onClick={onContinue} className={styles.continueButton}>
                {isLastRound ? 'See Results' : 'Next Round'}
            </button>
        </div>
    );
}
