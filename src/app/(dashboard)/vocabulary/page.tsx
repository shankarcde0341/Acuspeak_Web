import type { Metadata } from 'next';
import VocabularyView from '@/components/vocabulary/VocabularyView';

export const metadata: Metadata = {
  title: 'Saved Vocabulary & Flashcards — Acuspeak',
  description: 'Practice and master saved vocabulary words and spaced-repetition flashcards for fluent English communication.',
};

export default function VocabularyPage() {
  return <VocabularyView />;
}
