// src/components/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import styles from './AdminDashboard.module.css';

interface AttractionItem {
  id: string;
  name: string;
  description: string;
  category: string;
  submitted_by_username?: string;
  address: string;
}

export const AdminDashboard = ({ token, onClose }: { token: string, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [items, setItems] = useState<AttractionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        // Ambil data pending approval
        const res = await api.getPendingRecommendations(token);
        if (res.status === 'success') setItems(res.data);
      } else {
        // Ambil data yang sudah aktif (Live di Peta)
        const allRes = await api.getAttractions();
        if (allRes.status === 'success') {
          // Gabungkan food, fun, hotels jadi satu list
          const flatList = [
            ...allRes.data.food.map((i: any) => ({...i, category: 'food'})),
            ...allRes.data.fun.map((i: any) => ({...i, category: 'fun'})),
            ...allRes.data.hotels.map((i: any) => ({...i, category: 'hotels'}))
          ];
          setItems(flatList);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApprove = async (id: string, categoryStr: string) => {
    const map: Record<string, number> = { 'food': 1, 'fun': 2, 'hotels': 3 };
    const catId = map[categoryStr.toLowerCase()] || 1;
    if (confirm(`Setujui tempat "${categoryStr}" ini?`)) {
      await api.approveRecommendation(id, catId, token);
      fetchData(); 
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Tolak rekomendasi ini?')) {
      await api.rejectRecommendation(id, token);
      fetchData(); 
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const text = prompt(`Ketik "HAPUS" untuk menghapus "${name}" selamanya:`);
    if (text === "HAPUS") {
      try {
        const res = await api.deleteAttraction(id, token);
        alert(res.message);
        fetchData();
      } catch (err: any) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h2>🛡️ Admin Dashboard</h2>
          <button onClick={onClose} className={styles.closeBtn}>Tutup</button>
        </div>

        {/* Tab Navigasi */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.active : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Menunggu Verifikasi
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'active' ? styles.active : ''}`}
            onClick={() => setActiveTab('active')}
          >
            ✅ Data Aktif (Hapus)
          </button>
        </div>

        <div className={styles.content}>
          {loading ? <p>Loading data...</p> : (
            items.length === 0 ? <p style={{marginTop: 20, textAlign: 'center'}}>Data kosong.</p> : (
              <div className={styles.list}>
                {items.map(item => (
                  <div key={item.id} className={styles.card}>
                    <div className={styles.cardInfo}>
                      <h3>{item.name} <span className={styles.tag}>{item.category}</span></h3>
                      <p>{item.description}</p>
                      <small>📍 {item.address} {item.submitted_by_username && `| 👤 ${item.submitted_by_username}`}</small>
                    </div>
                    
                    <div className={styles.actions}>
                      {activeTab === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(item.id, item.category)} className={styles.approveBtn} title="Setujui">✅</button>
                          <button onClick={() => handleReject(item.id)} className={styles.rejectBtn} title="Tolak">❌</button>
                        </>
                      ) : (
                        <button onClick={() => handleDelete(item.id, item.name)} className={styles.deleteBtn} title="Hapus Permanen">🗑️ Hapus</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
