// Wiki Guesser - Multiple Choice Component

'use client';

import { useState } from 'react';
import styles from './MultipleChoice.module.css';

interface MultipleChoiceProps {
    options: string[];
    correctAnswer: string;
    onSelect: (answer: string) => void;
    disabled?: boolean;
}

export function MultipleChoice({ options, onSelect, disabled }: MultipleChoiceProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const handleSelect = (option: string) => {
        if (disabled || selectedAnswer) return;

        setSelectedAnswer(option);
        onSelect(option);
    };

    return (
        <div className={styles.container}>
            <p className={styles.instruction}>Select the correct answer:</p>
            <div className={styles.options}>
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(option)}
                        disabled={disabled || !!selectedAnswer}
                        className={`${styles.option} ${selectedAnswer === option ? styles.selected : ''
                            }`}
                    >
                        <span className={styles.optionLetter}>
                            {String.fromCharCode(65 + index)}
                        </span>
                        <span className={styles.optionText}>{option}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
