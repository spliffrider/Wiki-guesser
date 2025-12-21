// Question Loader - Loads curated questions from JSON files

import oddWikiOutData from '@/data/questions/odd-wiki-out.json';
import whenInWikiData from '@/data/questions/when-in-wiki.json';
import wikiOrFictionData from '@/data/questions/wiki-or-fiction.json';
import wikiLinksData from '@/data/questions/wiki-links.json';
import {
    OddWikiOutData,
    WhenInWikiData,
    WikiOrFictionData,
    WikiLinksData,
    QuestionCategory,
} from '@/types';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random questions of a specific category
export function getRandomOddWikiOut(count: number = 1): OddWikiOutData[] {
    const shuffled = shuffleArray(oddWikiOutData.questions as OddWikiOutData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getRandomWhenInWiki(count: number = 1): WhenInWikiData[] {
    const shuffled = shuffleArray(whenInWikiData.questions as WhenInWikiData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getRandomWikiOrFiction(count: number = 1): WikiOrFictionData[] {
    const shuffled = shuffleArray(wikiOrFictionData.questions as WikiOrFictionData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getRandomWikiLinks(count: number = 1): WikiLinksData[] {
    const shuffled = shuffleArray(wikiLinksData.questions as WikiLinksData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Get a random category for variety in gameplay
export function getRandomCategory(): QuestionCategory {
    const categories: QuestionCategory[] = [
        'wiki_what',
        'odd_wiki_out',
        'when_in_wiki',
        'wiki_or_fiction',
        'wiki_links',
    ];
    return categories[Math.floor(Math.random() * categories.length)];
}

// Get display name for category
export function getCategoryDisplayName(category: QuestionCategory): string {
    switch (category) {
        case 'wiki_what':
            return 'Wiki What?';
        case 'odd_wiki_out':
            return 'Odd Wiki Out';
        case 'when_in_wiki':
            return 'When in Wiki?';
        case 'wiki_or_fiction':
            return 'Wiki or Fiction?';
        case 'wiki_links':
            return 'Wiki Links';
    }
}

// Get prompt text for category
export function getCategoryPrompt(category: QuestionCategory): string {
    switch (category) {
        case 'wiki_what':
            return 'What is this Wikipedia article about?';
        case 'odd_wiki_out':
            return 'Which one doesn\'t belong?';
        case 'when_in_wiki':
            return 'When did this happen?';
        case 'wiki_or_fiction':
            return 'Is this fact true or false?';
        case 'wiki_links':
            return 'What connects these topics?';
    }
}
