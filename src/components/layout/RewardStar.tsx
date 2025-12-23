// Wiki Guesser - Reward Star Component
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './RewardStar.module.css';

export function RewardStar() {
    const { profile } = useAuth();
    const [points, setPoints] = useState(profile?.reward_points || 0);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (profile?.reward_points !== undefined && profile.reward_points !== points) {
            setPoints(profile.reward_points);
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 300);
            return () => clearTimeout(timer);
        }
    }, [profile?.reward_points, points]);

    if (!profile) return null;

    return (
        <Link href="/submit" className={styles.rewardStar} title="Reward Points (UGC)">
            <span className={`${styles.star} ${animate ? styles.bump : ''}`}>⭐</span>
            <span className={styles.points}>{points.toLocaleString()}</span>
        </Link>
    );
}
