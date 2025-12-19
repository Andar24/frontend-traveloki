import type { Category } from '../types';
import { CATEGORY_EMOJIS } from '../constants/attractions';
import styles from './CategoryFilter.module.css';

interface CategoryFilterProps {
  activeCategories: Record<Category, boolean>;
  onToggle: (category: Category) => void;
}

export const CategoryFilter = ({ activeCategories, onToggle }: CategoryFilterProps) => {
  const categories: Category[] = ['food', 'fun', 'hotels'];
  const labels = { food: 'Foods', fun: 'Fun', hotels: 'Hotels' };

  return (
    <div className={styles.offerings}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${styles.card} ${activeCategories[category] ? styles.active : styles.inactive}`}
          onClick={() => onToggle(category)}
          aria-label={`Toggle ${labels[category]} filter`}
        >
          <span className={styles.icon}>{CATEGORY_EMOJIS[category]}</span>
          <span>{labels[category]}</span>
        </button>
      ))}
    </div>
  );
};
