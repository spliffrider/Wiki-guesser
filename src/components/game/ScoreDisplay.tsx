// Wiki Guesser - Score Display Component

'use client';

import { formatScore, getStreakEmoji } from '@/lib/scoring';
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
    score: number;
    streak: number;
    currentRound: number;
    totalRounds: number;
}

export function ScoreDisplay({ score, streak, currentRound, totalRounds }: ScoreDisplayProps) {
    const streakEmoji = getStreakEmoji(streak);

    return (
        <div className={styles.container}>
            <div className={styles.scoreSection}>
                <span className={styles.label}>Score</span>
                <span className={styles.score}>{formatScore(score)}</span>
            </div>

            <div className={styles.roundSection}>
                <span className={styles.label}>Round</span>
                <span className={styles.round}>
                    {currentRound + 1} / {totalRounds}
                </span>
            </div>

            {streak >= 2 && (
                <div className={styles.streakSection}>
                    <span className={styles.streakBadge}>
                        {streakEmoji} {streak} streak!
                    </span>
                </div>
            )}
        </div>
    );
}
