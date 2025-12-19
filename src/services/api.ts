const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // === AUTH ===
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async register(username: string, email: string, password: string, full_name: string) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name }),
    });
    return response.json();
  },

  // === PUBLIC GET ===
  async getAttractions() {
    const response = await fetch(`${API_BASE_URL}/attractions/medan`);
    return response.json();
  },

  async searchAttractions(query: string) {
    const response = await fetch(`${API_BASE_URL}/attractions/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  async getNearbyAttractions(lat: number, lng: number, radius = 5) {
    const response = await fetch(`${API_BASE_URL}/attractions/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.json();
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  // === USER ===
  async submitRecommendation(data: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/attractions/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // === ADMIN FEATURES ===
  async getPendingRecommendations(token: string) {
    const response = await fetch(`${API_BASE_URL}/attractions/recommendations/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async approveRecommendation(id: string, categoryId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/attractions/recommendations/${id}/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ category_id: categoryId })
    });
    return response.json();
  },

  async rejectRecommendation(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/attractions/recommendations/${id}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createAttraction(data: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/attractions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteAttraction(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/attractions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
