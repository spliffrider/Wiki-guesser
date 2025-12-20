// Wiki Guesser - Leaderboard Table Component

'use client';

import { LeaderboardEntry } from '@/lib/leaderboard';
import { useAuth } from '@/contexts/AuthContext';
import styles from './LeaderboardTable.module.css';

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    type: 'alltime' | 'daily' | 'weekly';
    loading?: boolean;
}

export function LeaderboardTable({ entries, type, loading }: LeaderboardTableProps) {
    const { user } = useAuth();

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading leaderboard...</p>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyEmoji}>🏆</span>
                <p>No scores yet! Be the first to play.</p>
            </div>
        );
    }

    const getScoreDisplay = (entry: LeaderboardEntry) => {
        if (type === 'weekly') {
            return entry.week_score?.toLocaleString() || '0';
        }
        return entry.total_score?.toLocaleString() || '0';
    };

    const getSecondaryInfo = (entry: LeaderboardEntry) => {
        if (type === 'alltime') {
            return `${entry.games_played} games • ${entry.correct_answers} correct`;
        }
        if (type === 'daily') {
            return `${entry.difficulty} • ${entry.correct_count}/5 correct`;
        }
        if (type === 'weekly') {
            return `${entry.games_this_week} games • ${entry.correct_this_week} correct`;
        }
        return '';
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className={styles.table}>
            {entries.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = user?.id === entry.id;

                return (
                    <div
                        key={entry.id + index}
                        className={`${styles.row} ${isCurrentUser ? styles.currentUser : ''} ${rank <= 3 ? styles.topThree : ''}`}
                    >
                        <div className={styles.rank}>
                            {getRankBadge(rank)}
                        </div>
                        <div className={styles.info}>
                            <span className={styles.username}>
                                {entry.username}
                                {isCurrentUser && <span className={styles.youBadge}>You</span>}
                            </span>
                            <span className={styles.secondary}>
                                {getSecondaryInfo(entry)}
                            </span>
                        </div>
                        <div className={styles.score}>
                            {getScoreDisplay(entry)}
                            <span className={styles.scoreLabel}>pts</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
