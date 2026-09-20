import type { Metadata } from 'next';
import { getCategories } from '@/lib/lessons';
import CategoryCard from '@/components/dashboard/lessons/CategoryCard';
import styles from './Lessons.module.css';

export const metadata: Metadata = {
  title: 'Lessons — Acuspeak',
};

export default async function LessonsPage() {
  const categories = await getCategories();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Lessons</h1>
        <p className={styles.subtitle}>
          Choose a track below to start practicing real-world English conversations.
        </p>
      </header>

      <div className={styles.grid}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
