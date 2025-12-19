import { useEffect, useState } from 'react';
import { api } from '../services/api';
import styles from './AdminDashboard.module.css';

interface PendingItem {
  id: string;
  name: string;
  description: string;
  category: string;
  submitted_by_username: string;
  address: string;
}

export const AdminDashboard = ({ token, onClose }: { token: string, onClose: () => void }) => {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendings = async () => {
    try {
      const res = await api.getPendingRecommendations(token);
      if (res.status === 'success') setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendings();
  }, []);

  const handleApprove = async (id: string, categoryStr: string) => {
    // Mapping manual: string kategori frontend -> ID database
    // (Sesuaikan ID ini dengan isi tabel categories kamu di database!)
    const map: Record<string, number> = { 'food': 1, 'fun': 2, 'hotels': 3 };
    const catId = map[categoryStr.toLowerCase()] || 1;

    if (confirm(`Setujui "${categoryStr}" ini?`)) {
      await api.approveRecommendation(id, catId, token);
      fetchPendings(); // Refresh list
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Yakin tolak rekomendasi ini?')) {
      await api.rejectRecommendation(id, token);
      fetchPendings(); // Refresh list
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h2>🛡️ Admin Dashboard</h2>
          <button onClick={onClose} className={styles.closeBtn}>Tutup</button>
        </div>

        <div className={styles.content}>
          {loading ? <p>Loading data...</p> : (
            items.length === 0 ? <p>🎉 Tidak ada antrean persetujuan.</p> : (
              <div className={styles.list}>
                {items.map(item => (
                  <div key={item.id} className={styles.card}>
                    <div className={styles.cardInfo}>
                      <h3>{item.name} <span className={styles.tag}>{item.category}</span></h3>
                      <p>{item.description}</p>
                      <small>📍 {item.address} | 👤 {item.submitted_by_username || 'Anonim'}</small>
                    </div>
                    <div className={styles.actions}>
                      <button onClick={() => handleApprove(item.id, item.category)} className={styles.approveBtn} title="Terima">✅</button>
                      <button onClick={() => handleReject(item.id)} className={styles.rejectBtn} title="Tolak">❌</button>
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