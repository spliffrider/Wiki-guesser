// Wiki Guesser - Reward Star Component
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import styles from './RewardStar.module.css';

export function RewardStar() {
    const { profile, user } = useAuth();
    const [points, setPoints] = useState(profile?.reward_points || 0);
    const [animate, setAnimate] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const supabase = getSupabaseClient();

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

        if (!user || isAdding) return;

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
                // Force refresh the profile to update the UI
                window.location.reload();
            }
        } catch (err) {
            console.error('Failed to add tokens:', err);
        } finally {
            setIsAdding(false);
        }
    };

    if (!profile) return null;

    return (
        <div className={styles.container}>
            <Link href="/submit" className={styles.rewardStar} title="Submit your own questions and earn rewards!">
                <span className={`${styles.star} ${animate ? styles.bump : ''}`}>⭐</span>
                <span className={styles.label}>Creator Hub</span>
                <span className={styles.points}>{points.toLocaleString()}</span>
            </Link>
            <button
                onClick={handleAddTokens}
                className={styles.debugButton}
                disabled={isAdding}
                title="Add 1000 tokens (testing)"
            >
                {isAdding ? '...' : '+1k'}
            </button>
        </div>
    );
}
