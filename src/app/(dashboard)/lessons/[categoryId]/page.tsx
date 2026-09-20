import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategory, getLessons } from '@/lib/lessons';
import LessonRow from '@/components/dashboard/lessons/LessonRow';
import styles from './CategoryDetail.module.css';

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>;
}

export async function generateStaticParams() {
  return [
    { categoryId: 'daily' },
    { categoryId: 'interview' },
    { categoryId: 'business' },
    { categoryId: 'travel' },
  ];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await getCategory(categoryId);

  if (!category) {
    return { title: 'Not Found — Acuspeak' };
  }

  return {
    title: `${category.name} — Acuspeak`,
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const category = await getCategory(categoryId);

  if (!category) {
    notFound();
  }

  const lessons = await getLessons(categoryId);

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <Image
          src={category.image}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className={styles.overlay} />

        <div className={styles.heroContent}>
          <Link href="/lessons" className={styles.backLink}>
            <svg
              className={styles.backIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All lessons
          </Link>
          <h1 className={styles.title}>{category.name}</h1>
          <p className={styles.subline}>
            {lessons.length} lessons · Bite-sized · Practical
          </p>
        </div>
      </div>

      {/* Lesson List */}
      <section className={styles.lessonListSection}>
        <ol className={styles.lessonGrid}>
          {lessons.map((lesson, idx) => (
            <LessonRow key={lesson.id} lesson={lesson} index={idx} />
          ))}
        </ol>
      </section>
    </div>
  );
}
