// Wiki Guesser - Question Form Wrapper
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUGC } from '@/hooks/useUGC';
import { QuestionCategory } from '@/types';
import { QuestionData } from '@/types/ugc';
import styles from './QuestionForm.module.css';

interface QuestionFormProps {
    category: QuestionCategory;
    title: string;
    icon: string;
    children: (props: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateData: (updates: any) => void;
        isValid: boolean;
    }) => React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate: (data: any) => boolean;
    // Optional: Override submission logic (for anonymous submissions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmitOverride?: (data: any) => Promise<void>;
    // Optional: Flag for anonymous submissions (hides success redirect)
    isAnonymous?: boolean;
}

export function QuestionForm({
    category,
    title,
    icon,
    children,
    initialData,
    validate,
    onSubmitOverride,
    isAnonymous = false
}: QuestionFormProps) {
    const router = useRouter();
    const { submitQuestion, isLoading, error: submitError } = useUGC();
    const [formData, setFormData] = useState(initialData);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData = (updates: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFormData((prev: any) => ({ ...prev, ...updates }));
    };

    const isValid = validate(formData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isValid) {
            setError('Please fill in all required fields correctly.');
            return;
        }

        if (onSubmitOverride) {
            // Use custom submission logic (for anonymous)
            await onSubmitOverride(formData);
            return;
        }

        // Default authenticated submission
        const result = await submitQuestion({
            category,
            questionData: formData as QuestionData
        });

        if (result.error) {
            setError(result.error);
        } else {
            setIsSuccess(true);
            // Wait a bit then redirect (skip for anonymous)
            if (!isAnonymous) {
                setTimeout(() => {
                    router.push('/submit');
                }, 2000);
            }
        }
    };

    if (isSuccess) {
        return (
            <div className={styles.formContainer}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 className={styles.title}>Submitted!</h2>
                    <p>Your question has been sent for review. You&apos;ll earn points once it&apos;s approved!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.formContainer}>
            {!isAnonymous && (
                <Link href="/submit" className={styles.backLink}>
                    ← Back to Creator Hub
                </Link>
            )}

            <h1 className={styles.title}>
                <span>{icon}</span> Submit {title}
            </h1>

            <form onSubmit={handleSubmit}>
                {children({ data: formData, updateData, isValid })}

                {error && <div className={styles.error} style={{ marginTop: '1.5rem' }}>{error}</div>}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => router.push('/submit')}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading || !isValid}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Question'}
                    </button>
                </div>
            </form>
        </div>
    );
}
