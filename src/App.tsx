import { useState, useEffect } from 'react';
import type { Category, Attraction, Attractions, User } from './types';
import { Map } from './components/Map';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { api } from './services/api';
import travelLogo from './assets/travel.png';
import styles from './App.module.css';

function App() {
  const [activeCategories, setActiveCategories] = useState<Record<Category, boolean>>({
    food: true, fun: true, hotels: true,
  });
  const [attractions, setAttractions] = useState<Attractions>({ food: [], fun: [], hotels: [] });
  const [searchResult, setSearchResult] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('traveloki_token');
    const savedUser = localStorage.getItem('traveloki_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const response = await api.getAttractions();
      if (response.status === 'success') setAttractions(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleLoginSuccess = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('traveloki_token', tokenData);
    localStorage.setItem('traveloki_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('traveloki_token');
    localStorage.removeItem('traveloki_user');
    // window.location.reload(); // Opsional: refresh biar bersih
    alert("Berhasil logout");
  };

  const handleTestSubmit = async () => {
    if (!token) { setShowAuthModal(true); return; }
    
    const dummyData = {
      name: "Rekomendasi User " + user?.username,
      description: "Tempat keren baru ditemukan",
      lat: 3.5700 + (Math.random() * 0.02), 
      lng: 98.6600 + (Math.random() * 0.02),
      address: "Jl. Testing " + Math.floor(Math.random() * 100),
      category: "food"
    };

    if (confirm(`Kirim rekomendasi "${dummyData.name}"?`)) {
      try {
        const res = await api.submitRecommendation(dummyData, token);
        alert(res.message);
      } catch (err: any) { alert("Gagal: " + err.message); }
    }
  };

  if (loading) return <div className={styles.container}>Loading Traveloki...</div>;

  // === LOGIKA BARU: JIKA ADMIN, TAMPILKAN DASHBOARD SAJA ===
  if (user?.role === 'admin' && token) {
    return (
      <AdminDashboard 
        token={token} 
        onLogout={handleLogout} // Kita oper fungsi logout ke dashboard
      />
    );
  }

  // === TAMPILAN USER BIASA (PETA) ===
  return (
    <div className={styles.container}>
      {/* Header User/Login */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
        {user ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.9)', padding: '5px 12px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              👤 {user.username}
            </span>
            <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
            Login / Daftar
          </button>
        )}
      </div>

      <div className={styles.left}>
        <div>
          <header className={styles.header}>
            <div className={styles.brand}>
              <img src={travelLogo} alt="Logo" className={styles.logo} />
              <span>Traveloki</span>
            </div>
          </header>

          <div className={styles.content}>
            <h1 className={styles.title}>Explore Indonesia<br />Like Never Before</h1>
            <p className={styles.subtitle}>Discover the <strong>best</strong> food, entertainment, and stays</p>

            <button 
              onClick={handleTestSubmit}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
            >
              + Tambah Rekomendasi
            </button>

            <CategoryFilter activeCategories={activeCategories} onToggle={(c) => setActiveCategories(p => ({...p, [c]: !p[c]}))} />
            <SearchBar attractions={attractions} activeCategories={activeCategories} onSearch={setSearchResult} onCategoryActivate={(c) => setActiveCategories(p => ({...p, [c]: !p[c]}))} />
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <section className={styles.mapBox}>
          <Map attractions={attractions} activeCategories={activeCategories} searchResult={searchResult} />
        </section>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

export default App;
