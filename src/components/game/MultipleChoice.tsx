// Wiki Guesser - Multiple Choice Component
// Supports standard 4-option, 2-option true/false, and year selection modes

'use client';

import { useState } from 'react';
import styles from './MultipleChoice.module.css';

type ChoiceVariant = 'standard' | 'true_false' | 'year';

interface MultipleChoiceProps {
    options: string[];
    correctAnswer: string;
    onSelect: (answer: string) => void;
    disabled?: boolean;
    variant?: ChoiceVariant;
    instruction?: string;
}

export function MultipleChoice({
    options,
    onSelect,
    disabled,
    variant = 'standard',
    instruction,
}: MultipleChoiceProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const handleSelect = (option: string) => {
        if (disabled || selectedAnswer) return;

        setSelectedAnswer(option);
        onSelect(option);
    };

    const getDefaultInstruction = () => {
        switch (variant) {
            case 'true_false':
                return 'Is this statement true or false?';
            case 'year':
                return 'Select the correct year:';
            default:
                return 'Select the correct answer:';
        }
    };

    const getOptionLetter = (index: number) => {
        if (variant === 'true_false') {
            return options[index] === 'TRUE' ? '✓' : '✗';
        }
        if (variant === 'year') {
            return '📅';
        }
        return String.fromCharCode(65 + index);
    };

    const containerClass = `${styles.container} ${styles[`variant_${variant}`] || ''}`;
    const optionsClass = `${styles.options} ${variant === 'true_false' ? styles.optionsTwoColumn : ''} ${variant === 'year' ? styles.optionsYear : ''}`;

    return (
        <div className={containerClass}>
            <p className={styles.instruction}>{instruction || getDefaultInstruction()}</p>
            <div className={optionsClass}>
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(option)}
                        disabled={disabled || !!selectedAnswer}
                        className={`${styles.option} ${selectedAnswer === option ? styles.selected : ''} ${variant === 'true_false' ? (option === 'TRUE' ? styles.optionTrue : styles.optionFalse) : ''} ${variant === 'year' ? styles.optionYear : ''}`}
                    >
                        <span className={`${styles.optionLetter} ${variant === 'true_false' ? (option === 'TRUE' ? styles.letterTrue : styles.letterFalse) : ''}`}>
                            {getOptionLetter(index)}
                        </span>
                        <span className={styles.optionText}>{option}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
