// Wiki Guesser - Library Theme Homepage Component
// Based on Stitch "Library Theme Home" design with bookshelf game modes

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { calculateLevel, getLevelBadge } from '@/lib/levels';

interface GameMode {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    href: string;
    badge?: string;
}

const GAME_MODES: GameMode[] = [
    {
        id: 'classic',
        title: 'Classic Mode',
        description: 'The standard experience. Unlimited time, unlimited guesses.',
        icon: 'menu_book',
        gradient: 'bg-gradient-to-r from-[#881e1e] via-[#d41132] to-[#a00e26]',
        href: '/play/single?difficulty=easy',
    },
    {
        id: 'daily',
        title: 'Daily Challenge',
        description: 'One article per day. Compete against the world.',
        icon: 'calendar_today',
        gradient: 'bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1d4ed8]',
        href: '/play/single?mode=daily',
        badge: 'NEW',
    },
    {
        id: 'topics',
        title: 'Topic Select',
        description: 'History, Science, Art, and Pop Culture focused archives.',
        icon: 'category',
        gradient: 'bg-gradient-to-r from-[#3f6212] via-[#65a30d] to-[#4d7c0f]',
        href: '/play/single?difficulty=medium',
    },
    {
        id: 'multiplayer',
        title: 'Multiplayer',
        description: 'Face off in real-time battles of wit and speed.',
        icon: 'groups',
        gradient: 'bg-gradient-to-r from-[#4a044e] via-[#a21caf] to-[#7e22ce]',
        href: '/play/multi',
    },
];

export function LibraryHomepage() {
    const router = useRouter();
    const { user, profile } = useAuth();

    const level = calculateLevel(profile?.total_score || 0);
    const levelBadge = getLevelBadge(level);

    return (
        <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-12 font-display">
            {/* Hero Section */}
            <section className="relative w-full overflow-hidden rounded-2xl bg-[#2a1619] border border-[#482329] p-8 md:p-12 shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#221013] via-[#221013]/90 to-transparent z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center opacity-40"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200')" }}
                    />
                </div>

                <div className="relative z-10 max-w-2xl flex flex-col gap-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#482329]/50 border border-[#67323b] w-fit backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-amber-100/80 tracking-widest uppercase">
                            Daily Archive Open
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                        Test your knowledge in the{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                            Grand Library
                        </span>
                    </h2>

                    <p className="text-slate-300 text-lg font-light leading-relaxed max-w-lg">
                        Navigate through millions of articles. Guess the title from the content.
                        Expand your mind one volume at a time.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            onClick={() => router.push('/play/single')}
                            className="h-12 px-8 rounded bg-primary text-white font-bold tracking-wide shadow-lg hover:bg-[#b00e2a] transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">play_circle</span>
                            Start Guessing
                        </button>
                        <button
                            onClick={() => router.push('/play/single?mode=random')}
                            className="h-12 px-8 rounded bg-transparent border border-amber-900/50 text-amber-100 hover:bg-amber-900/20 transition-colors font-medium flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">casino</span>
                            Random Article
                        </button>
                    </div>
                </div>
            </section>

            {/* Game Modes Bookshelf */}
            <section className="flex flex-col gap-6">
                <div className="flex items-end justify-between px-2 pb-2 border-b border-[#482329]">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">shelves</span>
                            Collection
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Select a volume to begin playing</p>
                    </div>
                    <Link href="/submit" className="text-primary text-sm font-bold hover:underline">
                        View Full Archive →
                    </Link>
                </div>

                {/* Bookshelf */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-8 wood-shelf bg-[#281417] rounded-t-lg border-x border-x-[#3e2723] shadow-inner">
                    {GAME_MODES.map((mode, index) => (
                        <Link
                            key={mode.id}
                            href={mode.href}
                            className={`group relative aspect-[3/4] rounded-r-lg rounded-l-sm ${mode.gradient} book-spine-effect book-hover cursor-pointer shadow-book overflow-hidden`}
                        >
                            {/* Spine crease */}
                            <div className="absolute inset-y-0 left-0 w-8 bg-black/20 border-r border-white/10" />

                            {/* Badge */}
                            {mode.badge && (
                                <div className="absolute top-0 right-4 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-b shadow-md">
                                    {mode.badge}
                                </div>
                            )}

                            {/* Content */}
                            <div className="absolute top-8 left-10 right-4">
                                <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center mb-4 text-white">
                                    <span className="material-symbols-outlined">{mode.icon}</span>
                                </div>
                                <h4 className="text-2xl font-bold text-white leading-tight font-display mb-2 group-hover:text-amber-200 transition-colors">
                                    {mode.title}
                                </h4>
                                <p className="text-white/70 text-sm font-sans line-clamp-3">
                                    {mode.description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="absolute bottom-4 left-10 right-4 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs uppercase tracking-widest text-white font-bold">
                                    Vol. {['I', 'II', 'III', 'IV'][index]}
                                </span>
                                <span className="material-symbols-outlined text-white">arrow_forward</span>
                            </div>

                            {/* Leather texture overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            {user && profile && (
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#2a1619] border border-[#482329] rounded-xl p-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent opacity-50" />

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-amber-100 flex items-center gap-2">
                                <span className="material-symbols-outlined">history_edu</span>
                                Scholar&apos;s Ledger
                            </h3>
                            <span className="text-xs text-amber-500/80 font-mono tracking-wider">
                                Level {level} {levelBadge}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#221013] p-4 rounded border border-[#3e2723] flex flex-col gap-1">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Games Played</span>
                                <span className="text-3xl font-black text-white font-sans">
                                    {profile.games_played || 0}
                                </span>
                            </div>
                            <div className="bg-[#221013] p-4 rounded border border-[#3e2723] flex flex-col gap-1">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Score</span>
                                <span className="text-3xl font-black text-primary font-sans">
                                    {(profile.total_score || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="bg-[#221013] p-4 rounded border border-[#3e2723] flex flex-col gap-1">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Best Streak</span>
                                <span className="text-3xl font-black text-amber-500 font-sans">
                                    🔥 {profile.longest_streak || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#2a1619] border border-[#482329] rounded-xl p-6 flex flex-col justify-between shadow-xl">
                        <div>
                            <h3 className="text-xl font-bold text-amber-100 flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined">handyman</span>
                                Tools
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/submit"
                                        className="w-full flex items-center gap-3 p-3 rounded bg-[#221013] hover:bg-[#33181d] border border-[#3e2723] text-left transition-colors group"
                                    >
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">edit</span>
                                        <span className="text-slate-200 text-sm font-medium group-hover:text-white">Creator Hub</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/leaderboard"
                                        className="w-full flex items-center gap-3 p-3 rounded bg-[#221013] hover:bg-[#33181d] border border-[#3e2723] text-left transition-colors group"
                                    >
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">leaderboard</span>
                                        <span className="text-slate-200 text-sm font-medium group-hover:text-white">Leaderboards</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            )}

            {/* Wikipedia Dedication */}
            <section className="text-center py-8 border-t border-[#482329]">
                <p className="text-[#c9929b] text-sm mb-4">
                    Made with ❤️ for Wikipedia. Please support their mission to share knowledge freely.
                </p>
                <a
                    href="https://wikimediafoundation.org/give/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-[#b00e2a] text-white font-bold py-3 px-6 rounded transition-colors"
                >
                    ❤️ Donate to Wikipedia
                </a>
            </section>
        </main>
    );
}
