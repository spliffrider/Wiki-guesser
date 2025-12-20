// Wiki Guesser - TypeScript Type Definitions

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GamePhase = 'selecting' | 'playing' | 'between-rounds' | 'finished';

export interface WikiTopic {
    id: string;
    title: string;
    excerpt: string;
    imageUrl: string | null;
    categories: string[];
    pageUrl: string;
}

export interface Round {
    roundNumber: number;
    topic: WikiTopic;
    options: string[];  // Multiple choice options (shuffled, includes correct answer)
    timeLimit: number; // seconds
    startedAt: number | null;
    endedAt: number | null;
    guess: string | null;
    isCorrect: boolean | null;
    timeTakenMs: number | null;
    pointsEarned: number;
}

export interface GameState {
    difficulty: Difficulty;
    phase: GamePhase;
    currentRound: number;
    totalRounds: number;
    rounds: Round[];
    score: number;
    streak: number;
    longestStreak: number;
}

export interface ScoreBreakdown {
    basePoints: number;
    timeBonus: number;
    streakMultiplier: number;
    difficultyMultiplier: number;
    totalPoints: number;
}

export interface WikiSearchResult {
    title: string;
    description?: string;
    thumbnail?: string;
}

export interface GameConfig {
    difficulty: Difficulty;
    totalRounds: number;
    timeLimit: number; // seconds per round
}

// Difficulty configuration
export const DIFFICULTY_CONFIG: Record<Difficulty, {
    timeLimit: number;
    multiplier: number;
    showImage: boolean;
    showExcerpt: boolean;
    showCategories: boolean;
    excerptLength: number;
}> = {
    easy: {
        timeLimit: 45,
        multiplier: 1.0,
        showImage: true,  // Images shown (filtered for safe articles)
        showExcerpt: true,
        showCategories: true,
        excerptLength: 300,
    },
    medium: {
        timeLimit: 30,
        multiplier: 1.5,
        showImage: true,  // Images shown (filtered for safe articles)
        showExcerpt: true,
        showCategories: false,
        excerptLength: 150,
    },
    hard: {
        timeLimit: 20,
        multiplier: 2.0,
        showImage: false,  // No images for hard
        showExcerpt: true,
        showCategories: false,
        excerptLength: 100,
    },
    expert: {
        timeLimit: 15,
        multiplier: 3.0,
        showImage: false,
        showExcerpt: true, // but heavily redacted
        showCategories: false,
        excerptLength: 100,
    },
};
