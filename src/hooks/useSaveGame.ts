// Wiki Guesser - Reusable hook for saving game scores

'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveGame } from '@/lib/database';
import { Difficulty } from '@/types';

export function useSaveGame() {
    const { user } = useAuth();

    const saveGameIfLoggedIn = useCallback(async (
        difficulty: Difficulty,
        totalScore: number,
        roundsPlayed: number,
        correctCount: number,
        longestStreak: number
    ): Promise<boolean> => {
        if (!user) {
            // Guest user - don't save
            return false;
        }

        const { error } = await saveGame(
            user.id,
            difficulty,
            totalScore,
            roundsPlayed,
            correctCount,
            longestStreak
        );

        if (error) {
            console.error('Failed to save game:', error);
            return false;
        }

        return true;
    }, [user]);

    return { saveGameIfLoggedIn, isLoggedIn: !!user };
}
