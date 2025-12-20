// Wiki Guesser - Leveling System

// XP thresholds for each level (index = level - 1)
const LEVEL_THRESHOLDS = [
    0,      // Level 1: 0 XP
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1400,   // Level 7
    1900,   // Level 8
    2500,   // Level 9
    3200,   // Level 10
    4000,   // Level 11
    5000,   // Level 12
    6200,   // Level 13
    7600,   // Level 14
    9200,   // Level 15
    11000,  // Level 16
    13000,  // Level 17
    15200,  // Level 18
    17600,  // Level 19
    20200,  // Level 20
    23000,  // Level 21
    26000,  // Level 22
    29200,  // Level 23
    32600,  // Level 24
    36200,  // Level 25
    40000,  // Level 26
    44000,  // Level 27
    48200,  // Level 28
    52600,  // Level 29
    57200,  // Level 30
    // After level 30, each level requires 5000 more XP
];

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
    // Check predefined thresholds
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }

    // Beyond level 30: each level is 5000 XP
    const level30Threshold = LEVEL_THRESHOLDS[29];
    const extraXp = xp - level30Threshold;
    return 30 + Math.floor(extraXp / 5000);
}

/**
 * Get XP required for a specific level
 */
export function getXpForLevel(level: number): number {
    if (level <= 0) return 0;
    if (level <= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[level - 1];
    }
    // Beyond level 30
    const level30Threshold = LEVEL_THRESHOLDS[29];
    return level30Threshold + (level - 30) * 5000;
}

/**
 * Get progress to next level (0-100%)
 */
export function getLevelProgress(xp: number): number {
    const currentLevel = calculateLevel(xp);
    const currentLevelXp = getXpForLevel(currentLevel);
    const nextLevelXp = getXpForLevel(currentLevel + 1);

    const xpIntoLevel = xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    return Math.round((xpIntoLevel / xpNeeded) * 100);
}

/**
 * Get tier based on level (determines content difficulty)
 */
export type ContentTier = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export function getContentTier(level: number): ContentTier {
    if (level <= 5) return 'beginner';
    if (level <= 10) return 'intermediate';
    if (level <= 20) return 'advanced';
    if (level <= 30) return 'expert';
    return 'master';
}

/**
 * Get level badge emoji
 */
export function getLevelBadge(level: number): string {
    if (level >= 50) return '👑';
    if (level >= 30) return '🧙';
    if (level >= 20) return '🎓';
    if (level >= 10) return '📚';
    if (level >= 5) return '🌱';
    return '🌰';
}

/**
 * Wikipedia categories for level-appropriate content
 */
export const TIER_CATEGORIES: Record<ContentTier, string[]> = {
    beginner: [
        'Living people',
        'World Heritage Sites',
        '21st-century American actors',
        'American pop singers',
        'Association football players',
    ],
    intermediate: [
        'Countries',
        'Animals',
        '2020s films',
        'American television series',
        'Video games',
    ],
    advanced: [
        'Historical events',
        'Scientists',
        'Olympic sports',
        'World War II',
        'Ancient history',
    ],
    expert: [
        'Physics',
        'Philosophy',
        'Economics',
        'Astronomy',
        'Mathematics',
    ],
    master: [], // Uses random articles
};
