// Wiki Guesser - Vote Controls Component
'use client';

import { useState } from 'react';
import { useUGC } from '@/hooks/useUGC';
import styles from './VoteControls.module.css';

interface VoteControlsProps {
    questionId: string;
    initialUpvotes: number;
    initialDownvotes: number;
    userVote?: 'up' | 'down';
}

export function VoteControls({
    questionId,
    initialUpvotes,
    initialDownvotes,
    userVote: initialUserVote
}: VoteControlsProps) {
    // Local state for optimistic UI
    const [votes, setVotes] = useState({ up: initialUpvotes, down: initialDownvotes });
    const [userVote, setUserVote] = useState<'up' | 'down' | undefined>(initialUserVote);
    const { voteOnQuestion } = useUGC();
    const [isVoting, setIsVoting] = useState(false);

    const handleVote = async (type: 'up' | 'down') => {
        if (isVoting || userVote === type) return;

        // Optimistic update
        const previousVotes = { ...votes };
        const previousUserVote = userVote;

        setIsVoting(true);

        // Calculate new stats
        const newVotes = { ...votes };
        if (type === 'up') {
            newVotes.up += 1;
            if (userVote === 'down') newVotes.down -= 1;
        } else {
            newVotes.down += 1;
            if (userVote === 'up') newVotes.up -= 1;
        }

        setVotes(newVotes);
        setUserVote(type);

        const { error } = await voteOnQuestion({ questionId, voteType: type });

        if (error) {
            // Revert on error
            setVotes(previousVotes);
            setUserVote(previousUserVote);
            // Ideally show a toast here
            console.error(error);
        }

        setIsVoting(false);
    };

    return (
        <div className={styles.container}>
            <button
                onClick={() => handleVote('up')}
                className={`${styles.button} ${userVote === 'up' ? styles.activeUp : ''}`}
                disabled={isVoting}
                aria-label="Upvote"
            >
                ▲
            </button>
            <span className={styles.score}>
                {votes.up - votes.down}
            </span>
            <button
                onClick={() => handleVote('down')}
                className={`${styles.button} ${userVote === 'down' ? styles.activeDown : ''}`}
                disabled={isVoting}
                aria-label="Downvote"
            >
                ▼
            </button>
        </div>
    );
}
