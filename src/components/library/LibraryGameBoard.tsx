// Wiki Guesser - Library Theme Game Board Component
// Based on Stitch "Library Game Screen" design

'use client';

import { WikiTopic, Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { redactExcerpt } from '@/lib/wikipedia';

interface LibraryGameBoardProps {
    topic: WikiTopic;
    options: string[];
    difficulty: Difficulty;
    currentRound: number;
    totalRounds: number;
    score: number;
    streak: number;
    timeRemaining: number;
    onSubmitGuess: (guess: string) => void;
    onPause?: () => void;
    onHint?: () => void;
    onSkip?: () => void;
    // New props for game flow
    phase?: 'playing' | 'between-rounds';
    lastRound?: {
        isCorrect: boolean;
        guess: string | null;
        pointsEarned: number;
        correctAnswer: string;
    } | null;
    onNextRound?: () => void;
    // Category support
    category?: 'wiki_what' | 'odd_wiki_out' | 'when_in_wiki' | 'wiki_or_fiction' | 'wiki_links';
    categoryData?: any;
}

export function LibraryGameBoard({
    topic,
    options,
    difficulty,
    currentRound,
    totalRounds,
    score,
    streak,
    timeRemaining,
    onSubmitGuess,
    onPause,
    onHint,
    onSkip,
    phase = 'playing',
    lastRound,
    onNextRound,
    category = 'wiki_what',
    categoryData,
}: LibraryGameBoardProps) {
    const config = DIFFICULTY_CONFIG[difficulty];
    const progressPercent = (currentRound / totalRounds) * 100;

    // Logic for Wiki What category (default)
    const rawExcerpt = topic.excerpt ? topic.excerpt.slice(0, config.excerptLength) : '';
    const displayExcerpt = rawExcerpt ? redactExcerpt(rawExcerpt, topic.title) : '';

    // Generate streak dots (max 5 shown)
    const streakDots = Array.from({ length: 5 }, (_, i) => i < streak);

    return (
        <div className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 font-display relative">
            {/* Main Game Container */}
            <div className="relative w-full bg-[#2a1619] border border-[#482329] rounded-xl shadow-2xl p-4 md:p-8 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#221013] via-[#2a1619] to-[#1a0c0e]" />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Left Column: Article Excerpt (Paper Page) */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                        <div className="bg-[#f0e6d2] text-[#2b1d1f] rounded-lg shadow-page p-8 md:p-12 relative h-full flex flex-col transform transition-transform hover:scale-[1.002] origin-bottom-left min-h-[400px]">
                            {/* Paper texture overlay */}
                            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] rounded-lg pointer-events-none mix-blend-multiply" />

                            {/* Top border line */}
                            <div className="absolute top-0 left-8 right-8 h-8 border-b border-[#d6cbb5]" />

                            {/* Header */}
                            <div className="relative flex justify-between items-baseline mb-6 pb-2">
                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#5d4037]">
                                    {category === 'wiki_what' ? `Excerpt #${8291 + currentRound}` :
                                        category === 'odd_wiki_out' ? 'Anomaly Report' :
                                            category === 'when_in_wiki' ? 'Chronicle Entry' :
                                                category === 'wiki_or_fiction' ? 'Fact Verification' :
                                                    'Connection Map'}
                                </h2>
                                <span className="font-serif italic text-[#8d6e63]">
                                    Page {142 + currentRound}
                                </span>
                            </div>
                            <div className="w-full h-px bg-[#5d4037] mb-6" />

                            {/* Content Area */}
                            <div className="relative font-display text-lg md:text-xl leading-relaxed space-y-6 flex-grow overflow-y-auto pr-2">

                                {/* WIKI WHAT - Standard Excerpt */}
                                {category === 'wiki_what' && (
                                    <>
                                        {config.showImage && topic.imageUrl && (
                                            <div className="float-right ml-4 mb-4 w-48 h-36 rounded overflow-hidden border border-[#d6cbb5] shadow-md">
                                                <img
                                                    src={topic.imageUrl}
                                                    alt="Article hint"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {config.showExcerpt && (
                                            <div>
                                                <span className="text-4xl float-left mr-2 mt-[-6px] font-black text-primary">
                                                    {displayExcerpt.charAt(0) || '¶'}
                                                </span>
                                                <span dangerouslySetInnerHTML={{
                                                    __html: displayExcerpt.slice(1).replace(
                                                        /\[REDACTED\]/g,
                                                        '<span class="bg-[#2b1d1f]/80 text-transparent px-2 rounded select-none">████</span>'
                                                    ) || (topic.excerpt ? '' : 'Retrieving archive fragment...')
                                                }} />
                                            </div>
                                        )}

                                        {config.showCategories && topic.categories && topic.categories.length > 0 && (
                                            <div className="mt-6 pt-4 border-t border-[#d6cbb5]">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[#8d6e63] block mb-2">
                                                    Filed Under:
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {topic.categories.slice(0, 3).map((cat, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 bg-[#e8e0c5] text-[#5d4037] text-sm rounded border border-[#d6cbb5]"
                                                        >
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ODD WIKI OUT */}
                                {category === 'odd_wiki_out' && categoryData && (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-[#5d4037] italic mb-2">One of these entries does not belong in this collection. Identify the imposter.</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {(categoryData.items as string[]).map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 border border-[#d6cbb5] rounded bg-[#fcfbf9]/50">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-[#5d4037] text-[#f0e6d2] font-bold rounded-full text-sm">
                                                        {i + 1}
                                                    </span>
                                                    <span className="font-bold text-[#2b1d1f]">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* WHEN IN WIKI */}
                                {category === 'when_in_wiki' && categoryData && (
                                    <div className="flex flex-col gap-6 items-center text-center py-8">
                                        <span className="text-6xl text-[#5d4037]">📅</span>
                                        <div className="p-6 border-y-2 border-[#d6cbb5] w-full">
                                            <p className="text-2xl font-bold text-[#2b1d1f] leading-snug">
                                                {categoryData.event}
                                            </p>
                                        </div>
                                        <p className="text-[#8d6e63] uppercase tracking-widest text-sm font-bold">
                                            Establish Chronology
                                        </p>
                                    </div>
                                )}

                                {/* WIKI OR FICTION */}
                                {category === 'wiki_or_fiction' && categoryData && (
                                    <div className="flex flex-col gap-6 items-center text-center py-8">
                                        <div className="p-8 bg-[#e8e0c5] rounded-xl shadow-inner border border-[#d6cbb5]">
                                            <p className="text-2xl font-serif text-[#2b1d1f] leading-relaxed italic">
                                                "{categoryData.statement}"
                                            </p>
                                        </div>
                                        <p className="text-[#5d4037] font-bold">
                                            Is this statement verified via Wikipedia citation?
                                        </p>
                                    </div>
                                )}

                                {/* WIKI LINKS */}
                                {category === 'wiki_links' && categoryData && (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-[#5d4037] italic mb-4">Find the common connection between these articles:</p>
                                        <div className="flex flex-wrap gap-3 justify-center">
                                            {(categoryData.titles as string[]).map((title, i) => (
                                                <div key={i} className="px-4 py-2 bg-[#e8e0c5] border border-[#d6cbb5] rounded shadow-sm flex items-center gap-2">
                                                    <span className="text-[#8d6e63] text-sm">📖</span>
                                                    <span className="font-bold text-[#2b1d1f]">{title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Decorative divider */}
                                <div className="flex justify-center py-4">
                                    <span className="text-[#8d6e63] text-xl">❧</span>
                                </div>
                            </div>

                            {/* Page corner fold effect */}
                            <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-black/5 to-transparent rounded-br-lg pointer-events-none" />
                        </div>
                    </div>

                    {/* Right Column: Timer, Score, Answers */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Timer and Stats */}
                        <div className="flex items-center gap-4 bg-[#221013] border border-[#3e2723] p-4 rounded-lg">
                            {/* Circular Timer */}
                            <div className="relative w-16 h-16 shrink-0">
                                <svg className="w-16 h-16 transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="#3e2723"
                                        strokeWidth="4"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="#d41132"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={`${(timeRemaining / config.timeLimit) * 175.9} 175.9`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">{timeRemaining}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Current Score</span>
                                    <span className="text-primary font-mono font-bold text-lg">{score.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Streak</span>
                                    <div className="flex gap-1">
                                        {streakDots.map((active, i) => (
                                            <span
                                                key={i}
                                                className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500' : 'bg-[#3e2723]'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Question Header */}
                        <div className="bg-[#3e2723] text-amber-100 px-4 py-3 rounded-t-md border-b-2 border-gold flex items-center gap-2 shadow-lg">
                            <span className="material-symbols-outlined text-gold">quiz</span>
                            <h3 className="font-bold text-sm tracking-wide">Identify the Article Title</h3>
                        </div>

                        {/* Answer Options */}
                        <div className="flex flex-col gap-3">
                            {options.map((option, index) => (
                                <button
                                    key={option}
                                    onClick={() => phase === 'playing' && onSubmitGuess(option)}
                                    disabled={phase !== 'playing'}
                                    className={`group relative w-full text-left p-1 rounded shadow-card transition-all ${phase === 'playing'
                                        ? 'bg-[#fcfbf9] hover:bg-white hover:-translate-y-1 active:translate-y-0.5'
                                        : option === lastRound?.correctAnswer
                                            ? 'bg-green-100' // Correct answer context
                                            : option === lastRound?.guess && !lastRound?.isCorrect
                                                ? 'bg-red-100' // Wrong guess context
                                                : 'bg-[#fcfbf9] opacity-50'
                                        }`}
                                >
                                    <div className={`border rounded-sm p-4 h-full flex items-center justify-between ${option === lastRound?.correctAnswer
                                        ? 'border-green-500 border-l-4'
                                        : option === lastRound?.guess && !lastRound?.isCorrect
                                            ? 'border-red-500 border-l-4'
                                            : 'border-[#e0e0e0] border-l-4 border-l-amber-600 group-hover:border-l-primary'
                                        }`}>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-sans uppercase tracking-widest mb-1">
                                                Option {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="text-slate-800 font-display font-bold text-lg group-hover:text-primary transition-colors">
                                                {option}
                                            </span>
                                        </div>
                                        {(phase === 'playing' || option === lastRound?.correctAnswer) && (
                                            <span className={`material-symbols-outlined transition-opacity ${option === lastRound?.correctAnswer ? 'text-green-600 opacity-100' : 'text-primary opacity-0 group-hover:opacity-100'
                                                }`}>
                                                check_circle
                                            </span>
                                        )}
                                        {phase !== 'playing' && option === lastRound?.guess && !lastRound?.isCorrect && (
                                            <span className="material-symbols-outlined text-red-600">
                                                cancel
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        {phase === 'playing' ? (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {onHint && (
                                    <button
                                        onClick={onHint}
                                        className="flex items-center justify-center gap-2 px-3 py-3 rounded bg-[#221013] hover:bg-[#2d1b18] border border-[#3e2723] text-amber-100/80 hover:text-white transition-colors text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-lg">lightbulb</span>
                                        <span>Use Hint</span>
                                    </button>
                                )}
                                {onSkip && (
                                    <button
                                        onClick={onSkip}
                                        className="flex items-center justify-center gap-2 px-3 py-3 rounded bg-[#221013] hover:bg-[#2d1b18] border border-[#3e2723] text-amber-100/80 hover:text-white transition-colors text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-lg">skip_next</span>
                                        <span>Skip</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2">
                                <button
                                    onClick={onNextRound}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded bg-primary hover:bg-[#b00e2a] text-white font-bold transition-colors shadow-lg animate-pulse"
                                >
                                    <span>Next Round</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Overlay (for between-rounds) */}
                {phase === 'between-rounds' && lastRound && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-in">
                        <div className={`px-8 py-4 rounded-xl border-4 ${lastRound.isCorrect ? 'bg-green-900/90 border-green-500' : 'bg-red-900/90 border-red-500'} backdrop-blur-md shadow-2xl flex flex-col items-center gap-2`}>
                            <span className="material-symbols-outlined text-5xl text-white">
                                {lastRound.isCorrect ? 'verified' : 'error'}
                            </span>
                            <h2 className="text-3xl font-black text-white font-display uppercase tracking-widest">
                                {lastRound.isCorrect ? 'Correct!' : 'Missed It'}
                            </h2>
                            {lastRound.pointsEarned > 0 && (
                                <span className="text-amber-300 font-bold text-xl">
                                    +{lastRound.pointsEarned} Points
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Round Progress (Mobile-visible duplicate) */}
            <div className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-[#221013] border border-[#482329] rounded-full mx-auto">
                <span className="text-xs text-amber-500/80 font-bold uppercase tracking-wider">
                    Round {currentRound} of {totalRounds}
                </span>
                <div className="w-24 h-1.5 bg-[#3e2723] rounded-full overflow-hidden">
                    <div
                        className="bg-amber-600 h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div >
    );
}
