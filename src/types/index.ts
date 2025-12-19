// src/types/index.ts
export type Category = 'food' | 'fun' | 'hotels';

export interface Attraction {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  address?: string;
  rating?: string | number;
  image?: string | null;
  category?: string;
}

export interface Attractions {
  food: Attraction[];
  fun: Attraction[];
  hotels: Attraction[];
}

export interface ActiveCategories {
  food: boolean;
  fun: boolean;
  hotels: boolean;
}

// === TAMBAHAN BARU ===
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
  };
}