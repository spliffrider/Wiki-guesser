// Wiki Guesser - Sound Effects Hook

'use client';

import { useCallback, useRef, useEffect } from 'react';

// Sound URLs (using free sounds from public CDNs)
const SOUNDS = {
    correct: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3', // Ding
    wrong: 'https://cdn.freesound.org/previews/142/142608_1840739-lq.mp3', // Buzz
    timerWarning: 'https://cdn.freesound.org/previews/250/250629_4486188-lq.mp3', // Tick
    levelUp: 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3', // Fanfare
    achievement: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3', // Chime
};

type SoundName = keyof typeof SOUNDS;

export function useSound() {
    const audioRefs = useRef<Record<SoundName, HTMLAudioElement | null>>({
        correct: null,
        wrong: null,
        timerWarning: null,
        levelUp: null,
        achievement: null,
    });

    const isMutedRef = useRef(false);

    // Preload sounds on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        Object.entries(SOUNDS).forEach(([name, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 0.5;
            audioRefs.current[name as SoundName] = audio;
        });

        // Load mute preference from localStorage
        const savedMute = localStorage.getItem('wiki-guesser-muted');
        isMutedRef.current = savedMute === 'true';

        return () => {
            // Cleanup
            Object.values(audioRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });
        };
    }, []);

    const play = useCallback((sound: SoundName) => {
        if (isMutedRef.current) return;

        const audio = audioRefs.current[sound];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Ignore autoplay restrictions
            });
        }
    }, []);

    const playCorrect = useCallback(() => play('correct'), [play]);
    const playWrong = useCallback(() => play('wrong'), [play]);
    const playTimerWarning = useCallback(() => play('timerWarning'), [play]);
    const playLevelUp = useCallback(() => play('levelUp'), [play]);
    const playAchievement = useCallback(() => play('achievement'), [play]);

    const toggleMute = useCallback(() => {
        isMutedRef.current = !isMutedRef.current;
        localStorage.setItem('wiki-guesser-muted', String(isMutedRef.current));
        return isMutedRef.current;
    }, []);

    const isMuted = useCallback(() => isMutedRef.current, []);

    return {
        playCorrect,
        playWrong,
        playTimerWarning,
        playLevelUp,
        playAchievement,
        toggleMute,
        isMuted,
    };
}
