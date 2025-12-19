import { useRef } from 'react';
import type { Attraction, Attractions, Category } from '../types';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  attractions: Attractions;
  activeCategories: Record<Category, boolean>;
  onSearch: (result: Attraction | null, category?: Category) => void;
  onCategoryActivate: (category: Category) => void;
}

export const SearchBar = ({
  attractions,
  activeCategories,
  onSearch,
  onCategoryActivate,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !inputRef.current?.value.trim()) return;

    const query = inputRef.current.value.toLowerCase();
    let found: Attraction | null = null;
    let foundCategory: Category | null = null;

    for (const category of ['food', 'fun', 'hotels'] as Category[]) {
      const place = attractions[category].find((p) =>
        p.name.toLowerCase().includes(query),
      );
      if (place) {
        found = place;
        foundCategory = category;
        break;
      }
    }

    if (found && foundCategory) {
      if (!activeCategories[foundCategory]) {
        onCategoryActivate(foundCategory);
      }
      inputRef.current.value = found.name;
      onSearch(found, foundCategory);
    } else {
      alert(`"${query}" not found. Try searching for food places, attractions, or hotels!`);
      onSearch(null);
    }
  };

  return (
    <input
      ref={inputRef}
      type='text'
      className={styles.searchbar}
      placeholder='Search for a place...'
      onKeyPress={handleSearch}
      aria-label='Search destination'
    />
  );
};
