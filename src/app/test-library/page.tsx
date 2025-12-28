// Test page for Library Theme Components
// Navigate to /test-library to preview

'use client';

import { useState } from 'react';
import { LibraryHomepage, LibraryGameBoard, LibraryGameResult } from '@/components/library';
import { WikiTopic } from '@/types';

// Mock data for testing
const MOCK_TOPIC: WikiTopic = {
    id: 'mock-kudzu-001',
    title: 'Kudzu',
    excerpt: 'Kudzu is a group of climbing, coiling, and trailing perennial vines native to much of East Asia, Southeast Asia, and some Pacific islands. The name comes from the Japanese word for the plant. It is sometimes referred to as "the vine that ate the South" due to its rapid growth and ability to cover buildings and vegetation.',
    pageUrl: 'https://en.wikipedia.org/wiki/Kudzu',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kudzu_on_trees_in_Atlanta%2C_Georgia.jpg/1200px-Kudzu_on_trees_in_Atlanta%2C_Georgia.jpg',
    categories: ['Invasive plant species', 'Flora of Asia', 'Fabaceae'],
};

const MOCK_OPTIONS = ['Wisteria', 'Kudzu', 'Japanese Honeysuckle', 'Bamboo'];

type ViewMode = 'homepage' | 'game' | 'results';

export default function TestLibraryPage() {
    const [view, setView] = useState<ViewMode>('homepage');

    return (
        <div className="min-h-screen bg-[#1a0c0e] font-display">
            {/* View Switcher */}
            <div className="sticky top-0 z-50 bg-[#221013] border-b border-[#482329] p-4">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <h1 className="text-white font-bold">Library Theme Test</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('homepage')}
                            className={`px-4 py-2 rounded font-medium transition-colors ${view === 'homepage'
                                ? 'bg-primary text-white'
                                : 'bg-[#3e2723] text-slate-300 hover:bg-[#5d4037]'
                                }`}
                        >
                            📚 Homepage
                        </button>
                        <button
                            onClick={() => setView('game')}
                            className={`px-4 py-2 rounded font-medium transition-colors ${view === 'game'
                                ? 'bg-primary text-white'
                                : 'bg-[#3e2723] text-slate-300 hover:bg-[#5d4037]'
                                }`}
                        >
                            🎮 Game Board
                        </button>
                        <button
                            onClick={() => setView('results')}
                            className={`px-4 py-2 rounded font-medium transition-colors ${view === 'results'
                                ? 'bg-primary text-white'
                                : 'bg-[#3e2723] text-slate-300 hover:bg-[#5d4037]'
                                }`}
                        >
                            📊 Results
                        </button>
                    </div>
                </div>
            </div>

            {/* Component Preview */}
            {view === 'homepage' && <LibraryHomepage />}

            {view === 'game' && (
                <LibraryGameBoard
                    topic={MOCK_TOPIC}
                    options={MOCK_OPTIONS}
                    difficulty="medium"
                    currentRound={3}
                    totalRounds={10}
                    score={1250}
                    streak={3}
                    timeRemaining={24}
                    onSubmitGuess={(guess) => alert(`Selected: ${guess}`)}
                    onHint={() => alert('Hint requested!')}
                    onSkip={() => alert('Skip requested!')}
                />
            )}

            {view === 'results' && (
                <LibraryGameResult
                    topic={MOCK_TOPIC}
                    score={4850}
                    totalRounds={10}
                    longestStreak={7}
                    difficulty="Medium"
                    timeElapsed="3m 42s"
                    accuracy={80}
                    onPlayAgain={() => setView('game')}
                    onHome={() => setView('homepage')}
                />
            )}
        </div>
    );
}
