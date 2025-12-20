// Wiki Guesser - Scoring System

import { Difficulty, ScoreBreakdown, DIFFICULTY_CONFIG } from '@/types';

const BASE_POINTS = 100;
const MAX_TIME_BONUS = 50;
const STREAK_INCREMENT = 0.25; // 25% bonus per streak level
const MAX_STREAK_MULTIPLIER = 3.0;

/**
 * Calculate points for a correct answer
 */
export function calculateScore(
    timeTakenMs: number,
    timeLimit: number, // in seconds
    streak: number,
    difficulty: Difficulty
): ScoreBreakdown {
    const config = DIFFICULTY_CONFIG[difficulty];
    const timeLimitMs = timeLimit * 1000;

    // Time bonus: faster = more points
    // Full bonus at 0 time, scales down to 0 at time limit
    const timeRatio = Math.max(0, 1 - (timeTakenMs / timeLimitMs));
    const timeBonus = Math.round(MAX_TIME_BONUS * timeRatio);

    // Streak multiplier: starts at 1.0, increases by 25% per correct answer
    // Capped at 3.0x
    const streakMultiplier = Math.min(
        1 + (streak * STREAK_INCREMENT),
        MAX_STREAK_MULTIPLIER
    );

    // Difficulty multiplier from config
    const difficultyMultiplier = config.multiplier;

    // Calculate total
    const baseWithBonus = BASE_POINTS + timeBonus;
    const totalPoints = Math.round(baseWithBonus * streakMultiplier * difficultyMultiplier);

    return {
        basePoints: BASE_POINTS,
        timeBonus,
        streakMultiplier,
        difficultyMultiplier,
        totalPoints,
    };
}

/**
 * Format score with commas
 */
export function formatScore(score: number): string {
    return score.toLocaleString();
}

/**
 * Calculate time bonus percentage (for display)
 */
export function getTimeBonusPercentage(timeTakenMs: number, timeLimitMs: number): number {
    return Math.max(0, Math.round((1 - timeTakenMs / timeLimitMs) * 100));
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
    const seconds = Math.ceil(ms / 1000);
    return seconds.toString();
}

/**
 * Get streak emoji based on current streak
 */
export function getStreakEmoji(streak: number): string {
    if (streak >= 10) return '🔥🔥🔥';
    if (streak >= 5) return '🔥🔥';
    if (streak >= 2) return '🔥';
    return '';
}

/**
 * Get rank based on score
 */
export function getRank(score: number): { rank: string; color: string } {
    if (score >= 2000) return { rank: 'Wiki Mastermind', color: 'var(--color-gold)' };
    if (score >= 1500) return { rank: 'Expert Scholar', color: 'var(--color-silver)' };
    if (score >= 1000) return { rank: 'Knowledge Seeker', color: 'var(--color-bronze)' };
    if (score >= 500) return { rank: 'Curious Mind', color: 'var(--color-primary)' };
    return { rank: 'Beginner', color: 'var(--color-text-muted)' };
}
