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

  const handleSearchClick = () => {
    if (!inputRef.current?.value.trim()) return;
    const fakeEvent = { key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>;
    handleSearch(fakeEvent);
  };

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
    return R * c;
  };

  const handleUseMyLocation = () => {
    if (!userLocation) { alert('Location not available. Allow location access in your browser.'); return; }
    let best: { place: Attraction; category: Category; dist: number } | null = null;
    for (const category of ['food', 'fun', 'hotels'] as Category[]) {
      if (!activeCategories[category]) continue;
      for (const p of attractions[category]) {
        const d = haversine(userLocation, { lat: p.lat, lng: p.lng });
        if (!best || d < best.dist) best = { place: p, category, dist: d };
      }
    }
    if (best) {
      if (!activeCategories[best.category]) onCategoryActivate(best.category);
      inputRef.current!.value = best.place.name;
      onSearch(best.place, best.category);
    } else {
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
