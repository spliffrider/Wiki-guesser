// Wiki Guesser - Reward Star Component
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import styles from './RewardStar.module.css';

const DAILY_TOKEN_LIMIT = 2;
const STORAGE_KEY = 'debug_token_usage';

function getTokenUsageToday(): number {
    if (typeof window === 'undefined') return 0;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return 0;
        const { date, count } = JSON.parse(stored);
        const today = new Date().toDateString();
        return date === today ? count : 0;
    } catch {
        return 0;
    }
}

function incrementTokenUsage(): void {
    if (typeof window === 'undefined') return;
    const today = new Date().toDateString();
    const current = getTokenUsageToday();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: current + 1 }));
}

export function RewardStar() {
    const { profile, user } = useAuth();
    const [points, setPoints] = useState(profile?.reward_points || 0);
    const [animate, setAnimate] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [usesToday, setUsesToday] = useState(0);
    const supabase = getSupabaseClient();

    useEffect(() => {
        setUsesToday(getTokenUsageToday());
    }, []);

    useEffect(() => {
        if (profile?.reward_points !== undefined && profile.reward_points !== points) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPoints(profile.reward_points);
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 300);
            return () => clearTimeout(timer);
        }
    }, [profile?.reward_points, points]);

    const handleAddTokens = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || isAdding || usesToday >= DAILY_TOKEN_LIMIT) return;

        setIsAdding(true);
        try {
            const { error } = await supabase.rpc('award_points', {
                p_user_id: user.id,
                p_reward_type: 'achievement',
                p_points: 1000,
                p_description: 'Debug: Added 1000 tokens'
            });

            if (error) {
                console.error('Error adding tokens:', error);
            } else {
                incrementTokenUsage();
                window.location.reload();
            }
        } catch (err) {
            console.error('Failed to add tokens:', err);
        } finally {
            setIsAdding(false);
        }
    };

    if (!profile) return null;

    const remaining = DAILY_TOKEN_LIMIT - usesToday;
    const isExhausted = remaining <= 0;

    return (
        <div className={styles.container}>
            <Link href="/submit" className={styles.rewardStar} title="Submit your own questions and earn rewards!">
                <span className={`${styles.star} ${animate ? styles.bump : ''}`}>⭐</span>
                <span className={styles.label}>Creator Hub</span>
                <span className={styles.points}>{points.toLocaleString()}</span>
            </Link>
            <button
                onClick={handleAddTokens}
                className={`${styles.debugButton} ${isExhausted ? styles.exhausted : ''}`}
                disabled={isAdding || isExhausted}
                title={isExhausted ? 'Daily limit reached (2/day)' : `Add 1000 tokens (${remaining} left today)`}
            >
                {isAdding ? '...' : isExhausted ? '0' : `+1k`}
            </button>
        </div>
    );
}

