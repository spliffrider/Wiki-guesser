// Wiki Guesser - Guess Input with Autocomplete

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { searchArticles } from '@/lib/wikipedia';
import { WikiSearchResult } from '@/types';
import styles from './GuessInput.module.css';

interface GuessInputProps {
    onSubmit: (guess: string) => void;
    disabled?: boolean;
}

export function GuessInput({ onSubmit, disabled }: GuessInputProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<WikiSearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input on mount
    useEffect(() => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    }, [disabled]);

    // Search with debounce
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);

        try {
            const results = await searchArticles(searchQuery);
            setSuggestions(results);
            setIsOpen(results.length > 0);
            setSelectedIndex(-1);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            handleSearch(value);
        }, 200);
    };

    const handleSubmit = (value?: string) => {
        const guess = value ?? query;
        if (guess.trim()) {
            onSubmit(guess.trim());
            setQuery('');
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSubmit(suggestions[selectedIndex].title);
            } else {
                handleSubmit();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setSelectedIndex(-1);
        }
    };

    const handleSuggestionClick = (title: string) => {
        handleSubmit(title);
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    placeholder="Type your guess..."
                    className={styles.input}
                    disabled={disabled}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />
                <button
                    onClick={() => handleSubmit()}
                    disabled={disabled || !query.trim()}
                    className={styles.submitButton}
                    type="button"
                >
                    Submit
                </button>
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul className={styles.suggestions} role="listbox">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.title}
                            className={`${styles.suggestion} ${index === selectedIndex ? styles.selected : ''}`}
                            onClick={() => handleSuggestionClick(suggestion.title)}
                            role="option"
                            aria-selected={index === selectedIndex}
                        >
                            <span className={styles.suggestionTitle}>{suggestion.title}</span>
                            {suggestion.description && (
                                <span className={styles.suggestionDesc}>{suggestion.description}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {isSearching && (
                <div className={styles.searching}>Searching...</div>
            )}
        </div>
    );
}
