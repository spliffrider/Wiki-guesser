'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <Link href="/submit" className={styles.backButton}>
                    ← Back to Creator Hub
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>About Wiki Guesser</h1>
                    <p>Building a community of knowledge explorers.</p>
                </header>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Credits</h2>
                    <div className={styles.content}>
                        <h3>Testers & Contributors</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                            Special thanks to the early citizens of the Wiki Guesser universe helping us test and improve the experience.
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Jαmεs</li>
                            {/* Add more testers here */}
                        </ul>
                    </div>
                </section>
            </main>
        </div>
    );
}
