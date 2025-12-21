// Wiki Guesser - Category-specific Prompt Component
// Renders different UI based on question category

'use client';

import {
    QuestionCategory,
    WikiTopic,
    OddWikiOutData,
    WhenInWikiData,
    WikiOrFictionData,
    WikiLinksData,
    CategoryData,
} from '@/types';
import { getCategoryDisplayName, getCategoryPrompt } from '@/lib/questions';
import styles from './CategoryPrompt.module.css';

interface CategoryPromptProps {
    category: QuestionCategory;
    topic?: WikiTopic | null;
    categoryData?: CategoryData;
    displayExcerpt?: string;
    showImage?: boolean;
    showExcerpt?: boolean;
    showCategories?: boolean;
}

export function CategoryPrompt({
    category,
    topic,
    categoryData,
    displayExcerpt,
    showImage = true,
    showExcerpt = true,
    showCategories = false,
}: CategoryPromptProps) {
    const categoryName = getCategoryDisplayName(category);
    const prompt = getCategoryPrompt(category);

    return (
        <div className={styles.container}>
            <div className={styles.categoryBadge}>
                {categoryName}
            </div>

            <h2 className={styles.promptText}>{prompt}</h2>

            <div className={styles.content}>
                {renderCategoryContent()}
            </div>
        </div>
    );

    function renderCategoryContent() {
        switch (category) {
            case 'wiki_what':
                return renderWikiWhat();
            case 'odd_wiki_out':
                return renderOddWikiOut();
            case 'when_in_wiki':
                return renderWhenInWiki();
            case 'wiki_or_fiction':
                return renderWikiOrFiction();
            case 'wiki_links':
                return renderWikiLinks();
            default:
                return null;
        }
    }

    function renderWikiWhat() {
        if (!topic) return null;

        return (
            <>
                {showImage && topic.imageUrl && (
                    <div className={styles.imageContainer}>
                        <img
                            src={topic.imageUrl}
                            alt="Topic hint"
                            className={styles.topicImage}
                        />
                    </div>
                )}

                {showExcerpt && displayExcerpt && (
                    <div className={styles.excerptContainer}>
                        <p className={styles.excerpt}>{displayExcerpt}</p>
                    </div>
                )}

                {showCategories && topic.categories.length > 0 && (
                    <div className={styles.categories}>
                        <span className={styles.categoryLabel}>Categories:</span>
                        {topic.categories.map((cat, i) => (
                            <span key={i} className={styles.categoryTag}>{cat}</span>
                        ))}
                    </div>
                )}

                {!showImage && !showExcerpt && (
                    <div className={styles.noHints}>
                        <span className={styles.noHintsEmoji}>🤔</span>
                        <p>Expert mode: No hints available!</p>
                    </div>
                )}
            </>
        );
    }

    function renderOddWikiOut() {
        const data = categoryData as OddWikiOutData | undefined;
        if (!data) return null;

        return (
            <div className={styles.oddWikiOutGrid}>
                {data.items.map((item, index) => (
                    <div key={index} className={styles.oddWikiOutItem}>
                        <span className={styles.itemNumber}>{index + 1}</span>
                        <span className={styles.itemText}>{item}</span>
                    </div>
                ))}
            </div>
        );
    }

    function renderWhenInWiki() {
        const data = categoryData as WhenInWikiData | undefined;
        if (!data) return null;

        return (
            <div className={styles.whenInWikiContainer}>
                <div className={styles.eventCard}>
                    <span className={styles.eventIcon}>📅</span>
                    <p className={styles.eventText}>{data.event}</p>
                </div>
            </div>
        );
    }

    function renderWikiOrFiction() {
        const data = categoryData as WikiOrFictionData | undefined;
        if (!data) return null;

        return (
            <div className={styles.wikiOrFictionContainer}>
                <div className={styles.statementCard}>
                    <span className={styles.statementIcon}>❓</span>
                    <p className={styles.statementText}>{data.statement}</p>
                </div>
            </div>
        );
    }

    function renderWikiLinks() {
        const data = categoryData as WikiLinksData | undefined;
        if (!data) return null;

        return (
            <div className={styles.wikiLinksContainer}>
                <div className={styles.titlesGrid}>
                    {data.titles.map((title, index) => (
                        <div key={index} className={styles.linkTitle}>
                            <span className={styles.wikiIcon}>📖</span>
                            <span>{title}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
