export type Category = 'food' | 'fun' | 'hotels';

export interface Attraction {
  name: string;
  lat: number;
  lng: number;
  description: string;
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
