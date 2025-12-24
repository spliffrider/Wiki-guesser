// Wiki Guesser - Question Card Component
'use client';

import { CurationCandidateView } from '@/types/ugc';
import { VoteControls } from './VoteControls';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
    question: CurationCandidateView;
}

export function QuestionCard({ question }: QuestionCardProps) {
    const data = question.question_data as any;

    const renderContent = () => {
        // Generic content renderer based on common fields
        // This is a simplified view for voting purposes
        return (
            <div className={styles.content}>
                {data.title && <h3 className={styles.questionTitle}>{data.title}</h3>}
                {data.statement && <p className={styles.statement}>"{data.statement}"</p>}
                {data.event && <p className={styles.event}>{data.event}</p>}

                {/* Connection/Explanation usually exists */}
                {data.excerpt && <p className={styles.excerpt}>{data.excerpt}</p>}
                {data.connection && <p className={styles.connection}>Connection: {data.connection}</p>}

                {/* Show the "True/False" or options if relevant context */}
                {data.isTrue !== undefined && (
                    <div className={styles.badge}>
                        {data.isTrue ? 'True Fact' : 'Fiction'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.card}>
            <div className={styles.voteSection}>
                <VoteControls
                    questionId={question.id}
                    initialUpvotes={question.upvotes}
                    initialDownvotes={question.downvotes}
                // User vote would be here if we fetched it, but for now we assume neutral or optimistic local state
                />
            </div>

            <div className={styles.body}>
                <div className={styles.header}>
                    <span className={styles.categoryBadge}>
                        {question.category.replace(/_/g, ' ')}
                    </span>
                    <span className={styles.author}>
                        by {question.submitter_username || 'Anonymous'}
                    </span>
                    <span className={styles.date}>
                        {new Date(question.approved_at || question.submitted_at).toLocaleDateString()}
                    </span>
                </div>

                {renderContent()}

                <div className={styles.footer}>
                    <span className={styles.topic}>#{data.topic || 'General'}</span>
                </div>
            </div>
        </div>
    );
}
