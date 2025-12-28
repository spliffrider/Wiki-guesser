// Wiki Guesser - Library Theme Game Result Component
// Based on Stitch "Archivist's Report" design

'use client';

import { WikiTopic } from '@/types';

interface LibraryGameResultProps {
    topic: WikiTopic | null;
    score: number;
    totalRounds: number;
    longestStreak: number;
    difficulty: string;
    timeElapsed?: string;
    accuracy?: number;
    onPlayAgain: () => void;
    onHome: () => void;
}

export function LibraryGameResult({
    topic,
    score,
    totalRounds,
    longestStreak,
    difficulty,
    timeElapsed = '0m 0s',
    accuracy = 0,
    onPlayAgain,
    onHome,
}: LibraryGameResultProps) {
    const handleShare = async () => {
        const shareText = `🎮 I scored ${score.toLocaleString()} points in Wiki Guesser!\n🔥 ${longestStreak} streak | ${difficulty} difficulty\n\nCan you beat my score? Play at:`;
        const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Wiki Guesser Score',
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            alert('Score copied to clipboard!');
        }
    };

    return (
        <main className="flex-grow flex items-center justify-center p-6 md:p-10 relative font-display">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/0 via-black/40 to-black/80" />

            <div className="relative w-full max-w-[960px] flex flex-col gap-6">
                {/* Page Heading / Status */}
                <div className="text-center md:text-left space-y-2 mb-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-between gap-4">
                        <div>
                            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-1">
                                Session Complete
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black text-[#eaddcf]">
                                Archivist&apos;s Report
                            </h2>
                        </div>
                        {/* Status Stamp */}
                        <div className="border-4 border-primary/40 text-primary px-4 py-2 rounded-lg transform -rotate-2 backdrop-blur-sm bg-primary/5">
                            <span className="font-black text-lg md:text-xl tracking-widest">
                                STATUS: VERIFIED
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Results Card (The Ledger) */}
                <div className="bg-[#f2e8dc] text-[#2c1810] rounded-lg shadow-2xl overflow-hidden relative">
                    {/* Paper texture overlay */}
                    <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />

                    {/* Card Content */}
                    <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-8">
                        {/* Left Column: The Answer */}
                        <div className="flex-1 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-[#d4c5b5] pb-6 md:pb-0 md:pr-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[#8c7b70] text-sm uppercase font-bold tracking-wider">
                                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                                    <span>The Correct Volume Was</span>
                                </div>

                                {topic?.imageUrl && (
                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-inner border border-[#d4c5b5]">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-700"
                                            style={{ backgroundImage: `url("${topic.imageUrl}")` }}
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                            <h3 className="text-white text-2xl font-bold font-display">
                                                {topic?.title || 'Unknown'}
                                            </h3>
                                        </div>
                                    </div>
                                )}

                                {!topic?.imageUrl && topic?.title && (
                                    <div className="bg-[#ebe0d3] p-6 rounded-lg border border-[#d4c5b5]">
                                        <h3 className="text-[#2c1810] text-2xl font-bold font-display">
                                            {topic.title}
                                        </h3>
                                    </div>
                                )}

                                {topic?.excerpt && (
                                    <p className="text-[#5c4b45] text-base leading-relaxed font-serif italic border-l-4 border-primary/30 pl-4 py-1 bg-[#ebe0d3] rounded-r-md">
                                        &ldquo;{topic.excerpt.slice(0, 150)}...&rdquo;
                                    </p>
                                )}

                                {topic?.pageUrl && (
                                    <div className="text-[#5c4b45]">
                                        <a
                                            href={topic.pageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-2 text-primary font-bold text-sm hover:text-[#a30d26] transition-colors"
                                        >
                                            <span>Read Full Article</span>
                                            <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                                                arrow_forward
                                            </span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Stats & Actions */}
                        <div className="flex-1 flex flex-col justify-between gap-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#ebe0d3] p-4 rounded border border-[#d4c5b5] flex flex-col items-center text-center shadow-sm">
                                    <span className="material-symbols-outlined text-[#8c7b70] mb-1">workspace_premium</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#8c7b70]">Final Score</span>
                                    <span className="text-3xl font-black text-primary font-sans mt-1">
                                        {score.toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-[#ebe0d3] p-4 rounded border border-[#d4c5b5] flex flex-col items-center text-center shadow-sm">
                                    <span className="material-symbols-outlined text-[#8c7b70] mb-1">timer</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#8c7b70]">Time Elapsed</span>
                                    <span className="text-3xl font-black text-[#2c1810] font-sans mt-1">{timeElapsed}</span>
                                </div>
                                <div className="bg-[#ebe0d3] p-4 rounded border border-[#d4c5b5] flex flex-col items-center text-center shadow-sm">
                                    <span className="material-symbols-outlined text-[#8c7b70] mb-1">psychology</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#8c7b70]">Best Streak</span>
                                    <span className="text-3xl font-black text-[#2c1810] font-sans mt-1">{longestStreak}</span>
                                </div>
                                <div className="bg-[#ebe0d3] p-4 rounded border border-[#d4c5b5] flex flex-col items-center text-center shadow-sm">
                                    <span className="material-symbols-outlined text-[#8c7b70] mb-1">trending_up</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#8c7b70]">Accuracy</span>
                                    <span className="text-3xl font-black text-[#2c1810] font-sans mt-1">{accuracy}%</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-[#d4c5b5] w-full my-2" />

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onPlayAgain}
                                    className="w-full bg-primary hover:bg-[#b00e2a] text-white font-bold py-4 px-6 rounded shadow-lg transform active:translate-y-0.5 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <span className="material-symbols-outlined group-hover:animate-bounce">play_circle</span>
                                    <span className="text-lg tracking-wide">Investigate Next Volume</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-full bg-transparent border-2 border-[#8c7b70] hover:border-primary hover:text-primary text-[#5c4b45] font-bold py-3 px-6 rounded transition-colors flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined">share</span>
                                    <span>Share Your Report</span>
                                </button>
                                <button
                                    onClick={onHome}
                                    className="w-full bg-transparent border-2 border-[#8c7b70] hover:border-primary hover:text-primary text-[#5c4b45] font-bold py-3 px-6 rounded transition-colors flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined">library_books</span>
                                    <span>Return to Collection</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Footer of the Paper */}
                    <div className="bg-[#ebe0d3] p-2 text-center border-t border-[#d4c5b5]">
                        <p className="text-[10px] text-[#8c7b70] font-mono tracking-widest uppercase">
                            WikiGuesser Library System • {totalRounds} Rounds • {difficulty} Mode
                        </p>
                    </div>
                </div>

                {/* Wikipedia Donation */}
                <div className="bg-[#33191e]/50 border border-[#482329] p-4 rounded text-center">
                    <p className="text-[#c9929b] text-sm mb-3">
                        This game was made with ❤️ for Wikipedia. Please support their mission.
                    </p>
                    <a
                        href="https://wikimediafoundation.org/give/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-[#b00e2a] text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        <span>❤️ Donate to Wikipedia</span>
                    </a>
                </div>
            </div>
        </main>
    );
}
