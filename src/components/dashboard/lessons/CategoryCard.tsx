import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/lessons';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/lessons/${category.id}`} className={styles.card}>
      <Image
        src={category.image}
        alt=""
        fill
        sizes="(max-width: 560px) 100vw, 50vw"
        style={{ objectFit: 'cover' }}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h2 className={styles.title}>{category.name}</h2>
        <span className={styles.subtitle}>{category.lessonCount} lessons</span>
      </div>
    </Link>
  );
}
