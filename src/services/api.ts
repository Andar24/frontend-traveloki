const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const api = {
  // Attractions
  async getAttractions() {
    const response = await fetch(`${API_BASE_URL}/attractions/medan`);
    return response.json();
  },

  async searchAttractions(query: string) {
    const response = await fetch(`${API_BASE_URL}/attractions/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  async getNearbyAttractions(lat: number, lng: number, radius = 5) {
    const response = await fetch(
      `${API_BASE_URL}/attractions/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return response.json();
  },

  // Categories
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  }
};