// Wiki Guesser - Submission Hub Page
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUGC } from '@/hooks/useUGC';
import { UserRewardSummary } from '@/types/ugc';
import styles from './page.module.css';

const CATEGORIES = [
    {
        id: 'wiki_what',
        name: 'Wiki What?',
        description: 'Create clues for a Wikipedia article. Can you guess the topic?',
        icon: '📝'
    },
    {
        id: 'wiki_or_fiction',
        name: 'Wiki or Fiction?',
        description: 'Write a statement that is either a true Wikipedia fact or completely made up.',
        icon: '⚖️'
    },
    {
        id: 'odd_wiki_out',
        name: 'Odd Wiki Out',
        description: 'Find 4 items where 3 are connected and 1 is an impostor.',
        icon: '🔍'
    },
    {
        id: 'when_in_wiki',
        name: 'When in Wiki?',
        description: 'Describe a historical event and challenge players to guess the correct year.',
        icon: '📅'
    },
    {
        id: 'wiki_links',
        name: 'Wiki Links',
        description: 'Link 4 Wikipedia articles with a common connection.',
        icon: '🔗'
    }
];

export default function SubmitHubPage() {
    const { user, profile } = useAuth();
    const { fetchUserSummary, isLoading } = useUGC();
    const [summary, setSummary] = useState<UserRewardSummary | null>(null);

    useEffect(() => {
        if (user) {
            fetchUserSummary().then(setSummary);
        }
    }, [user, fetchUserSummary]);

    if (!user) {
        return (
            <div className={styles.loadingContainer}>
                <p>Please log in to submit questions.</p>
                <Link href="/auth/login" className={styles.playButton}>Log In</Link>
            </div>
        );
    }

    if (isLoading && !summary) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading your submission dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Creator Hub</h1>
                    <p className={styles.subtitle}>Help expand the Wiki Guesser universe and earn points!</p>
                </header>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{summary?.totalPoints || 0}</span>
                        <span className={styles.statLabel}>Reward Points</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{summary?.questionsSubmitted || 0}</span>
                        <span className={styles.statLabel}>Submitted</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{summary?.questionsApproved || 0}</span>
                        <span className={styles.statLabel}>Approved</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{summary?.questionsCurated || 0}</span>
                        <span className={styles.statLabel}>Curated 🌟</span>
                    </div>
                </div>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Submit a New Question</h2>
                    <div className={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/submit/${cat.id}`}
                                className={styles.categoryCard}
                            >
                                <span className={styles.categoryIcon}>{cat.icon}</span>
                                <h3 className={styles.categoryName}>{cat.name}</h3>
                                <p className={styles.categoryDesc}>{cat.description}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {summary?.recentRewards && summary.recentRewards.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Recent Reward History</h2>
                        <div className={styles.rewardHistory}>
                            <div className={styles.rewardList}>
                                {summary.recentRewards.map((reward) => (
                                    <div key={reward.id} className={styles.rewardItem}>
                                        <div className={styles.rewardInfo}>
                                            <span className={styles.rewardDescription}>
                                                {reward.description || reward.reward_type.replace(/_/g, ' ')}
                                            </span>
                                            <span className={styles.rewardDate}>
                                                {new Date(reward.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className={styles.rewardPoints}>
                                            +{reward.points_earned}⭐
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
