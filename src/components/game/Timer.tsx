// Wiki Guesser - Timer Component

'use client';

import { useEffect, useState } from 'react';
import styles from './Timer.module.css';

interface TimerProps {
    timeRemaining: number; // milliseconds
    timeLimit: number; // seconds
}

export function Timer({ timeRemaining, timeLimit }: TimerProps) {
    const timeLimitMs = timeLimit * 1000;
    const percentage = (timeRemaining / timeLimitMs) * 100;
    const seconds = Math.ceil(timeRemaining / 1000);

    // Determine color state
    const getColorState = () => {
        if (percentage > 50) return 'normal';
        if (percentage > 25) return 'warning';
        return 'danger';
    };

    const colorState = getColorState();

    return (
        <div className={styles.timerContainer}>
            <div className={styles.timerHeader}>
                <span className={styles.timerLabel}>Time</span>
                <span className={`${styles.timerValue} ${styles[colorState]}`}>
                    {seconds}s
                </span>
            </div>
            <div className={styles.timerBar}>
                <div
                    className={`${styles.timerBarFill} ${styles[colorState]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
