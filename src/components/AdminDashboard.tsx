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

export const AdminDashboard = ({ token, onLogout }: { token: string, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [items, setItems] = useState<AttractionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Tambah
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'food',
    lat: '', lng: '', address: ''
  });

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

  // Actions
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
    if (confirm(`Yakin ingin MENGHAPUS PERMANEN "${name}"?`)) {
      try {
        const res = await api.deleteAttraction(id, token);
        alert(res.message);
        fetchData();
      } catch (err: any) { alert("Gagal menghapus: " + err.message); }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      };
      const res = await api.createAttraction(payload, token);
      if (res.status === 'success') {
        alert('Berhasil menambahkan tempat baru!');
        setShowAddForm(false);
        setFormData({ name: '', description: '', category: 'food', lat: '', lng: '', address: '' });
        setActiveTab('active'); 
        fetchData();
      } else {
        alert('Gagal: ' + res.message);
      }
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <h1>🛡️ Admin Panel</h1>
          <span className={styles.badge}>Super User</span>
        </div>
        <button onClick={onLogout} className={styles.logoutBtn}>Logout / Keluar</button>
      </div>

      <div className={styles.main}>
        {/* TABS */}
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
            ✅ Data Aktif (Kelola)
          </button>
        </div>

        {/* TOMBOL TAMBAH (Hanya di Tab Active) */}
        {activeTab === 'active' && (
          <button className={styles.addBtn} onClick={() => setShowAddForm(true)}>
            + Tambah Tempat Baru
          </button>
        )}

        {/* MODAL FORM TAMBAH */}
        {showAddForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Tambah Tempat Wisata</h2>
              <form onSubmit={handleCreate} className={styles.form}>
                <input required placeholder="Nama Tempat" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
                <select value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                  <option value="food">Kuliner (Food)</option>
                  <option value="fun">Hiburan (Fun)</option>
                  <option value="hotels">Penginapan (Hotels)</option>
                </select>
                <div style={{display:'flex', gap:'10px'}}>
                  <input required placeholder="Latitude (ex: 3.595)" value={formData.lat} onChange={e=>setFormData({...formData, lat:e.target.value})} />
                  <input required placeholder="Longitude (ex: 98.672)" value={formData.lng} onChange={e=>setFormData({...formData, lng:e.target.value})} />
                </div>
                <input required placeholder="Alamat Lengkap" value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} />
                <textarea required placeholder="Deskripsi Singkat" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
                
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowAddForm(false)} className={styles.cancelBtn}>Batal</button>
                  <button type="submit" className={styles.saveBtn}>Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LIST DATA */}
        <div className={styles.content}>
          {loading ? <p>Loading data...</p> : (
            items.length === 0 ? <p className={styles.empty}>Tidak ada data.</p> : (
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
