// Wiki Guesser - Avatar Library

export interface Avatar {
    id: string;
    emoji: string;
    label: string;
}

export const AVATARS: Avatar[] = [
    { id: 'wiki-1', emoji: '📚', label: 'Books' },
    { id: 'wiki-2', emoji: '🧠', label: 'Brain' },
    { id: 'wiki-3', emoji: '🔬', label: 'Science' },
    { id: 'wiki-4', emoji: '🌍', label: 'Globe' },
    { id: 'wiki-5', emoji: '🎓', label: 'Graduate' },
    { id: 'wiki-6', emoji: '🦉', label: 'Owl' },
    { id: 'wiki-7', emoji: '🔮', label: 'Crystal Ball' },
    { id: 'wiki-8', emoji: '🚀', label: 'Rocket' },
    { id: 'wiki-9', emoji: '🏛️', label: 'Museum' },
    { id: 'wiki-10', emoji: '🎨', label: 'Art' },
    { id: 'wiki-11', emoji: '🎭', label: 'Theater' },
    { id: 'wiki-12', emoji: '🌌', label: 'Galaxy' },
];

export function getAvatarById(id: string | null): Avatar | null {
    if (!id) return null;
    return AVATARS.find(a => a.id === id) ?? null;
}

export function getAvatarEmoji(id: string | null): string | null {
    const avatar = getAvatarById(id);
    return avatar?.emoji ?? null;
}
