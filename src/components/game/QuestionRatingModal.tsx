// Wiki Guesser - Question Rating Modal
// Allows users to rate questions on a 0-100 scale after game completion

'use client';

import { useState } from 'react';
import { PlayedQuestion, QuestionRating } from '@/types';
import styles from './QuestionRatingModal.module.css';

interface Props {
    questions: PlayedQuestion[];
    onSubmit: (ratings: QuestionRating[]) => void;
    onSkip: () => void;
}

export function QuestionRatingModal({ questions, onSubmit, onSkip }: Props) {
    // Initialize ratings with middle value (50)
    const [ratings, setRatings] = useState<Record<string, number>>(
        questions.reduce((acc, q) => ({ ...acc, [q.id]: 50 }), {})
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRatingChange = (questionId: string, value: number) => {
        setRatings(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const ratingArray: QuestionRating[] = questions.map(q => ({
            question_id: q.id,
            category: q.category,
            rating_value: ratings[q.id]
        }));

        await onSubmit(ratingArray);
        setIsSubmitting(false);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Rate Your Questions!</h2>
                <p className={styles.subtitle}>
                    Help us improve! Rate each question from 0-100 (optional)
                </p>

                <div className={styles.questionsContainer}>
                    {questions.map((question, index) => (
                        <div key={question.id} className={styles.questionItem}>
                            <div className={styles.questionHeader}>
                                <span className={styles.roundNumber}>#{question.roundNumber}</span>
                                <span className={styles.questionTitle}>{question.title}</span>
                            </div>

                            <div className={styles.sliderContainer}>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={ratings[question.id]}
                                    onChange={(e) => handleRatingChange(question.id, parseInt(e.target.value))}
                                    className={styles.slider}
                                />
                                <span className={styles.ratingValue}>{ratings[question.id]}</span>
                            </div>

                            <div className={styles.labels}>
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <button
                        onClick={onSkip}
                        className={styles.skipButton}
                        disabled={isSubmitting}
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Ratings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
