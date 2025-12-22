// Wiki Guesser - TypeScript Type Definitions

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GamePhase = 'selecting' | 'playing' | 'between-rounds' | 'finished';

// Question category types
export type QuestionCategory =
    | 'wiki_what'       // Guess the Wikipedia article from clues
    | 'odd_wiki_out'    // Find the item that doesn't belong
    | 'when_in_wiki'    // Guess the year of a historical event
    | 'wiki_or_fiction' // Is this statement true or false?
    | 'wiki_links';     // What connects these articles?

// Category-specific data structures
export interface OddWikiOutData {
    items: string[];        // 4 items: 3 belong together, 1 is the impostor
    impostorIndex: number;  // Index of the item that doesn't belong
    connection: string;     // What connects the 3 correct items
    topic: string;          // Category/Topic of the question
}

export interface WhenInWikiData {
    event: string;          // Description of the historical event
    correctYear: number;    // The actual year
    yearOptions: number[];  // 4 year choices (shuffled, includes correct)
    topic: string;          // Category/Topic of the question
}

export interface WikiOrFictionData {
    statement: string;      // The claim to evaluate
    isTrue: boolean;        // Whether the statement is true
    explanation: string;    // Explanation shown after answering
    topic: string;          // Category/Topic of the question
    source?: string;        // Optional Wikipedia article source
}

export interface WikiLinksData {
    titles: string[];           // 4 Wikipedia article titles
    connection: string;         // What connects them
    topic: string;              // Category/Topic of the question
    connectionOptions?: string[]; // Multiple choice options for connection
}

export type CategoryData =
    | OddWikiOutData
    | WhenInWikiData
    | WikiOrFictionData
    | WikiLinksData;

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
    category: QuestionCategory;
    topic: WikiTopic;           // Used for wiki_what, can be partial for other categories
    options: string[];          // Multiple choice options (2 for wiki_or_fiction, 4 for others)
    correctAnswer: string;      // The correct answer for this round
    categoryData?: CategoryData; // Category-specific data
    timeLimit: number;          // seconds
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
