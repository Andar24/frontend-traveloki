import { useState } from 'react';
import type { Category, Attraction } from './types';
import { Map } from './components/Map';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { MEDAN_ATTRACTIONS } from './constants/attractions';
import travelLogo from './assets/travel.png';
import styles from './App.module.css';

function App() {
  const [activeCategories, setActiveCategories] = useState<Record<Category, boolean>>({
    food: true,
    fun: true,
    hotels: true,
  });

  const [searchResult, setSearchResult] = useState<Attraction | null>(null);

  const toggleCategory = (category: Category) => {
    setActiveCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSearch = (result: Attraction | null) => {
    setSearchResult(result);
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div>
          <header className={styles.header}>
            <div className={styles.brand}>
              <img src={travelLogo} alt="Traveloki Logo" className={styles.logo} />
              <span>Traveloki</span>
            </div>
          </header>

          <div className={styles.content}>
            <h1 className={styles.title}>
              Explore Indonesia
              <br />
              Like Never Before
            </h1>
            <p className={styles.subtitle}>
              Discover the <strong>best</strong> food, entertainment, and stays
            </p>

            <CategoryFilter activeCategories={activeCategories} onToggle={toggleCategory} />

            <SearchBar
              attractions={MEDAN_ATTRACTIONS}
              activeCategories={activeCategories}
              onSearch={handleSearch}
              onCategoryActivate={toggleCategory}
            />
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <section className={styles.mapBox}>
          <Map
            attractions={MEDAN_ATTRACTIONS}
            activeCategories={activeCategories}
            searchResult={searchResult}
          />
        </section>
      </div>
    </div>
  );
}

export default App;