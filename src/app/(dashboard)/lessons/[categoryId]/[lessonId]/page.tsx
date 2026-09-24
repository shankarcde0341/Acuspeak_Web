import type { Metadata } from 'next';
import Link from 'next/link';
import InteractiveLesson from '@/components/InteractiveLesson';
import { getLessonData } from '@/services/lessonService';
import styles from './LessonDetail.module.css';

interface LessonDetailPageProps {
  params: Promise<{ categoryId: string; lessonId: string }>;
}

export async function generateMetadata({
  params,
}: LessonDetailPageProps): Promise<Metadata> {
  const { categoryId, lessonId } = await params;
  const lessonData = getLessonData(lessonId);
  return {
    title: `${lessonData.title} — Acuspeak`,
  };
}

export default async function LessonDetailPage({
  params,
}: LessonDetailPageProps) {
  const { categoryId, lessonId } = await params;

  return (
    <div className={styles.container}>
      <nav className={styles.navBar} aria-label="Lesson Navigation">
        <Link href={`/lessons/${categoryId}`} className={styles.backLink}>
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
          Back to Lessons
        </Link>
      </nav>

      <InteractiveLesson lessonId={lessonId} />
    </div>
  );
}
