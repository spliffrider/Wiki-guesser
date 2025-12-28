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
}: LibraryGameBoardProps) {
    const config = DIFFICULTY_CONFIG[difficulty];
    const progressPercent = (currentRound / totalRounds) * 100;

    // ALWAYS redact the answer from excerpts
    const rawExcerpt = topic.excerpt.slice(0, config.excerptLength);
    const displayExcerpt = redactExcerpt(rawExcerpt, topic.title);

    // Generate streak dots (max 5 shown)
    const streakDots = Array.from({ length: 5 }, (_, i) => i < streak);

    return (
        <div className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 font-display">
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
                            <div className="relative flex justify-between items-baseline mb-6 border-b-2 border-[#2b1d1f] pb-2">
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d6e63]">
                                    Excerpt #{Math.floor(Math.random() * 9000 + 1000)}-{String.fromCharCode(65 + currentRound)}
                                </h2>
                                <span className="font-serif italic text-[#8d6e63]">
                                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode
                                </span>
                            </div>

                            {/* Article Excerpt */}
                            <div className="relative font-display text-lg md:text-xl leading-relaxed space-y-6 flex-grow overflow-y-auto pr-2">
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
                                            {displayExcerpt.charAt(0)}
                                        </span>
                                        <span dangerouslySetInnerHTML={{
                                            __html: displayExcerpt.slice(1).replace(
                                                /\[REDACTED\]/g,
                                                '<span class="bg-[#2b1d1f]/80 text-transparent px-2 rounded select-none">████</span>'
                                            )
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
                        <div className="flex items-center gap-4 bg-[#221013] border border-[#3e2723] p-4 rounded-lg shadow-inner">
                            {/* Circular Timer */}
                            <div className="relative size-20 shrink-0">
                                <div className="absolute inset-0 rounded-full border-4 border-[#3e2723]" />
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                                    style={{
                                        transform: `rotate(${(1 - timeRemaining / config.timeLimit) * 360}deg)`,
                                        transition: 'transform 1s linear'
                                    }}
                                />
                                <div className="absolute inset-2 bg-[#2a1619] rounded-full flex items-center justify-center flex-col shadow-inner">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">hourglass_top</span>
                                    <span className="text-white font-bold text-lg leading-none">{timeRemaining}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-col gap-1 w-full">
                                <div className="flex justify-between items-center border-b border-[#3e2723] pb-1 mb-1">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Current Score</span>
                                    <span className="text-amber-400 font-mono font-bold">{score.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Streak</span>
                                    <div className="flex gap-0.5">
                                        {streakDots.map((active, i) => (
                                            <span
                                                key={i}
                                                className={`size-2 rounded-full ${active ? 'bg-green-500' : 'bg-[#3e2723]'}`}
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
                                    onClick={() => onSubmitGuess(option)}
                                    className="group relative w-full text-left bg-[#fcfbf9] hover:bg-white p-1 rounded shadow-card transition-all hover:-translate-y-1 active:translate-y-0.5"
                                >
                                    <div className="border border-[#e0e0e0] border-l-4 border-l-[#8d6e63] group-hover:border-l-primary rounded-sm p-4 h-full flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-sans uppercase tracking-widest mb-1">
                                                Option {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="text-slate-800 font-display font-bold text-lg group-hover:text-primary transition-colors">
                                                {option}
                                            </span>
                                        </div>
                                        <span className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-primary transition-opacity">
                                            check_circle
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
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
                    </div>
                </div>
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
        </div>
    );
}
