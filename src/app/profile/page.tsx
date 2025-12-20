// Wiki Guesser - Profile Page

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getGameHistory } from '@/lib/database';
import { Game } from '@/types/database';
import { Header } from '@/components/layout/Header';
import styles from './page.module.css';

export default function ProfilePage() {
    const router = useRouter();
    const { user, profile, isLoading } = useAuth();
    const [games, setGames] = useState<Game[]>([]);
    const [loadingGames, setLoadingGames] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            getGameHistory(user.id, 10).then(data => {
                setGames(data);
                setLoadingGames(false);
            });
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    const accuracy = profile.games_played > 0
        ? Math.round((profile.correct_answers / (profile.games_played * 5)) * 100)
        : 0;

    return (
        <div className={styles.container}>
            <Header />

            <main className={styles.main}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                        {profile.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={styles.profileInfo}>
                        <h1 className={styles.username}>{profile.username || 'Anonymous'}</h1>
                        <p className={styles.email}>{user.email}</p>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{profile.total_score.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Score</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{profile.games_played}</span>
                        <span className={styles.statLabel}>Games Played</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{profile.correct_answers}</span>
                        <span className={styles.statLabel}>Correct Answers</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{accuracy}%</span>
                        <span className={styles.statLabel}>Accuracy</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{profile.longest_streak} 🔥</span>
                        <span className={styles.statLabel}>Best Streak</span>
                    </div>
                </div>

                <section className={styles.historySection}>
                    <h2 className={styles.sectionTitle}>Recent Games</h2>

                    {loadingGames ? (
                        <p className={styles.loading}>Loading...</p>
                    ) : games.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No games played yet!</p>
                            <Link href="/" className={styles.playButton}>
                                Play Now
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.gamesList}>
                            {games.map((game) => (
                                <div key={game.id} className={styles.gameCard}>
                                    <div className={styles.gameInfo}>
                                        <span className={styles.gameDifficulty}>{game.difficulty}</span>
                                        <span className={styles.gameDate}>
                                            {new Date(game.completed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={styles.gameStats}>
                                        <span className={styles.gameScore}>{game.total_score} pts</span>
                                        <span className={styles.gameCorrect}>
                                            {game.correct_count}/{game.rounds_played} correct
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className={styles.actions}>
                    <Link href="/" className={styles.playButton}>
                        Play Again
                    </Link>
                </div>
            </main>
        </div>
    );
}
