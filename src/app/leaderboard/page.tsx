// Wiki Guesser - Leaderboard Page

'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import {
    getAllTimeLeaderboard,
    getDailyLeaderboard,
    getWeeklyLeaderboard,
    LeaderboardEntry
} from '@/lib/leaderboard';
import styles from './page.module.css';

type LeaderboardType = 'alltime' | 'daily' | 'weekly';

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<LeaderboardType>('alltime');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);

            let data: LeaderboardEntry[] = [];

            switch (activeTab) {
                case 'alltime':
                    data = await getAllTimeLeaderboard();
                    break;
                case 'daily':
                    data = await getDailyLeaderboard();
                    break;
                case 'weekly':
                    data = await getWeeklyLeaderboard();
                    break;
            }

            setEntries(data);
            setLoading(false);
        };

        fetchLeaderboard();
    }, [activeTab]);

    const tabs: { value: LeaderboardType; label: string; description: string }[] = [
        { value: 'alltime', label: '🏆 All-Time', description: 'Total lifetime scores' },
        { value: 'daily', label: '📅 Today', description: 'Best single game today' },
        { value: 'weekly', label: '📊 This Week', description: 'Weekly total scores' },
    ];

    return (
        <div className={styles.container}>
            <Header />

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Leaderboard</h1>
                    <p className={styles.subtitle}>See how you stack up against other players</p>
                </div>

                <div className={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`${styles.tab} ${activeTab === tab.value ? styles.activeTab : ''}`}
                        >
                            <span className={styles.tabLabel}>{tab.label}</span>
                            <span className={styles.tabDesc}>{tab.description}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.tableContainer}>
                    <LeaderboardTable
                        entries={entries}
                        type={activeTab}
                        loading={loading}
                    />
                </div>
            </main>
        </div>
    );
}
