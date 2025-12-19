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

// Props berubah: sekarang menerima onLogout
export const AdminDashboard = ({ token, onLogout }: { token: string, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [items, setItems] = useState<AttractionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const res = await api.getPendingRecommendations(token);
        if (res.status === 'success') setItems(res.data);
      } else {
        const allRes = await api.getAttractions();
        if (allRes.status === 'success') {
          const flatList = [
            ...allRes.data.food.map((i: any) => ({...i, category: 'food'})),
            ...allRes.data.fun.map((i: any) => ({...i, category: 'fun'})),
            ...allRes.data.hotels.map((i: any) => ({...i, category: 'hotels'}))
          ];
          setItems(flatList);
        }
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

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
      } catch (err: any) { alert("Gagal menghapus: " + err.message); }
    }
  };

  return (
    <div className={styles.container}>
      {/* SIDEBAR / HEADER */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <h1>🛡️ Admin Panel</h1>
          <span className={styles.badge}>Super User</span>
        </div>
        
        <button onClick={onLogout} className={styles.logoutBtn}>
          Keluar / Logout
        </button>
      </div>

      <div className={styles.main}>
        {/* TABS */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.active : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Menunggu Verifikasi ({items.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'active' ? styles.active : ''}`}
            onClick={() => setActiveTab('active')}
          >
            ✅ Data Aktif (Kelola)
          </button>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {loading ? <p>Loading data...</p> : (
            items.length === 0 ? <p className={styles.empty}>Tidak ada data saat ini.</p> : (
              <div className={styles.grid}>
                {items.map(item => (
                  <div key={item.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={`${styles.catTag} ${styles[item.category]}`}>{item.category}</span>
                      {activeTab === 'pending' && <span className={styles.pendingTag}>New</span>}
                    </div>
                    
                    <h3>{item.name}</h3>
                    <p className={styles.desc}>{item.description}</p>
                    <div className={styles.meta}>
                      <small>📍 {item.address}</small>
                      {item.submitted_by_username && <small>👤 {item.submitted_by_username}</small>}
                    </div>
                    
                    <div className={styles.actions}>
                      {activeTab === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(item.id, item.category)} className={styles.approveBtn}>Setujui</button>
                          <button onClick={() => handleReject(item.id)} className={styles.rejectBtn}>Tolak</button>
                        </>
                      ) : (
                        <button onClick={() => handleDelete(item.id, item.name)} className={styles.deleteBtn}>Hapus Permanen</button>
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
