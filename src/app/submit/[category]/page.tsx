// Wiki Guesser - Dynamic Submission Page
'use client';

import { use } from 'react';
import { QuestionCategory } from '@/types';
import { QuestionForm } from '@/components/submit/QuestionForm';
import { WikiWhatFields } from '@/components/submit/fields/WikiWhatFields';
import { WikiOrFictionFields } from '@/components/submit/fields/WikiOrFictionFields';
import { OddWikiOutFields } from '@/components/submit/fields/OddWikiOutFields';
import { WhenInWikiFields } from '@/components/submit/fields/WhenInWikiFields';
import { WikiLinksFields } from '@/components/submit/fields/WikiLinksFields';

interface PageProps {
    params: Promise<{ category: string }>;
}

const CATEGORY_MAP: Record<string, { title: string; icon: string }> = {
    wiki_what: { title: 'Wiki What?', icon: '📝' },
    wiki_or_fiction: { title: 'Wiki or Fiction?', icon: '⚖️' },
    odd_wiki_out: { title: 'Odd Wiki Out', icon: '🔍' },
    when_in_wiki: { title: 'When in Wiki?', icon: '📅' },
    wiki_links: { title: 'Wiki Links', icon: '🔗' }
};

export default function CategorySubmitPage({ params }: PageProps) {
    const { category } = use(params);
    const catInfo = CATEGORY_MAP[category];

    if (!catInfo) {
        return <div>Category not found</div>;
    }

    const renderFields = (props: any) => {
        switch (category) {
            case 'wiki_what': return <WikiWhatFields {...props} />;
            case 'wiki_or_fiction': return <WikiOrFictionFields {...props} />;
            case 'odd_wiki_out': return <OddWikiOutFields {...props} />;
            case 'when_in_wiki': return <WhenInWikiFields {...props} />;
            case 'wiki_links': return <WikiLinksFields {...props} />;
            default: return null;
        }
    };

    const getInitialData = () => {
        switch (category) {
            case 'wiki_what': return { title: '', excerpt: '', imageUrl: '', wrongOptions: ['', '', ''], topic: '' };
            case 'wiki_or_fiction': return { statement: '', isTrue: true, explanation: '', topic: '', source: '' };
            case 'odd_wiki_out': return { items: ['', '', '', ''], impostorIndex: 0, connection: '', topic: '' };
            case 'when_in_wiki': return { event: '', correctYear: new Date().getFullYear(), yearOptions: [0, 0, 0, 0], topic: '' };
            case 'wiki_links': return { titles: ['', '', '', ''], connection: '', connectionOptions: ['', '', '', ''], topic: '' };
            default: return {};
        }
    };

    const validate = (data: any) => {
        switch (category) {
            case 'wiki_what':
                return !!(data.title && data.excerpt && data.topic && data.wrongOptions.every((o: string) => !!o));
            case 'wiki_or_fiction':
                return !!(data.statement && data.explanation && data.topic);
            case 'odd_wiki_out':
                return !!(data.connection && data.topic && data.items.every((i: string) => !!i));
            case 'when_in_wiki':
                return !!(data.event && data.correctYear && data.topic);
            case 'wiki_links':
                return !!(data.connection && data.topic && data.titles.every((t: string) => !!t));
            default:
                return false;
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', padding: '2rem 1rem' }}>
            <main style={{ maxWidth: '800px', margin: '0 auto' }}>
                <QuestionForm
                    category={category as QuestionCategory}
                    title={catInfo.title}
                    icon={catInfo.icon}
                    initialData={getInitialData()}
                    validate={validate}
                >
                    {renderFields}
                </QuestionForm>
            </main>
        </div>
    );
}
