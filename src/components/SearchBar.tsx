import { useRef } from 'react';
import type { Attraction, Attractions, Category } from '../types';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  attractions: Attractions;
  activeCategories: Record<Category, boolean>;
  onSearch: (result: Attraction | null, category?: Category) => void;
  onCategoryActivate: (category: Category) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const SearchBar = ({
  attractions,
  activeCategories,
  onSearch,
  onCategoryActivate,
  userLocation,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    performSearch();
  };

  const performSearch = (explicitQuery?: string) => {
    const raw = (explicitQuery ?? inputRef.current?.value ?? '').trim();
    if (!raw) return;
    const query = raw.toLowerCase();
    let found: Attraction | null = null;
    let foundCategory: Category | null = null;

    for (const category of ['food', 'fun', 'hotels'] as Category[]) {
      const place = attractions[category].find((p) => p.name.toLowerCase().includes(query));
      if (place) {
        found = place;
        foundCategory = category;
        break;
      }
    }

    if (found && foundCategory) {
      if (!activeCategories[foundCategory]) onCategoryActivate(foundCategory);
      inputRef.current!.value = found.name;
      onSearch(found, foundCategory);
    } else {
      alert(`"${query}" not found. Try searching for food places, attractions, or hotels!`);
      onSearch(null);
    }
  };

  const handleSearchClick = () => performSearch();

  const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371e3; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon), Math.sqrt(1 - (sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon)));
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type='text'
            className={styles.searchbar}
            placeholder='Search for a place...'
            onKeyPress={handleSearch}
            aria-label='Search destination'
            style={{ paddingRight: 40 }}
          />

          {/* Arrow search button inside input (right) */}
          <button
            onClick={handleSearchClick}
            aria-label='Search'
            title='Search'
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M3 12h14' stroke='#111827' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              <path d='M13 5l7 7-7 7' stroke='#111827' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </button>
        </div>

        <button
          onClick={handleUseMyLocation}
          title='Use my location'
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 8,
            background: '#10b981',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M12 2v2' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
            <path d='M12 20v2' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
            <path d='M4 12H2' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
            <path d='M22 12h-2' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
            <path d='M17.657 6.343l-1.414 1.414' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
            <path d='M7.757 16.243l-1.414 1.414' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
            <circle cx='12' cy='12' r='3' stroke='white' strokeWidth='2' />
          </svg>
          My Location
        </button>
      </div>
    );
      alert('No nearby places found for the active categories.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        ref={inputRef}
        type='text'
        className={styles.searchbar}
        placeholder='Search for a place...'
        onKeyPress={handleSearch}
        aria-label='Search destination'
      />
      <button onClick={handleSearchClick} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
        Search
      </button>
      <button onClick={handleUseMyLocation} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
        Use My Location
      </button>
    </div>
  );
};
