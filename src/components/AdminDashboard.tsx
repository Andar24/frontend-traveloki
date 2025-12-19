import { useEffect, useState } from 'react';
import { api } from '../services/api';
import styles from './AdminDashboard.module.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon marker leaflet yang kadang hilang di react
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface AttractionItem {
  id: string;
  name: string;
  description: string;
  category: string;
  submitted_by_username?: string;
  address: string;
}

// Komponen Peta Kecil untuk Memilih Lokasi
const LocationPicker = ({ onLocationSelect, initialPos }: { onLocationSelect: (lat: number, lng: number) => void, initialPos: {lat: number, lng: number} | null }) => {
  const [position, setPosition] = useState(initialPos);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <MapContainer 
      center={[3.5952, 98.6722]} // Default Medan
      zoom={13} 
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapEvents />
      {position && <Marker position={position} />}
    </MapContainer>
  );
};

export const AdminDashboard = ({ token, onLogout }: { token: string, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [items, setItems] = useState<AttractionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
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

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`HAPUS PERMANEN "${name}"?`)) {
      await api.deleteAttraction(id, token);
      fetchData();
    }
  };

  const handleApprove = async (id: string, categoryStr: string) => {
    const map: Record<string, number> = { 'food': 1, 'fun': 2, 'hotels': 3 };
    const catId = map[categoryStr.toLowerCase()] || 1;
    if (confirm(`Setujui tempat ini?`)) {
      await api.approveRecommendation(id, catId, token);
      fetchData(); 
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Tolak rekomendasi?')) {
      await api.rejectRecommendation(id, token);
      fetchData(); 
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
        alert('✅ Tempat berhasil ditambahkan!');
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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <h1>🛡️ Admin Control Center</h1>
        </div>
        <button onClick={onLogout} className={styles.logoutBtn}>Logout</button>
      </div>

      <div className={styles.main}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.active : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Menunggu Approval
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'active' ? styles.active : ''}`}
            onClick={() => setActiveTab('active')}
          >
            ✅ Data Aktif
          </button>
        </div>

        {/* Tombol Tambah (Hanya di Active) */}
        {activeTab === 'active' && (
          <button className={styles.addBtn} onClick={() => setShowAddForm(true)}>
            + Tambah Tempat Baru
          </button>
        )}

        {/* --- MODAL TAMBAH KEREN --- */}
        {showAddForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>📍 Tambah Destinasi Baru</h2>
                <button onClick={() => setShowAddForm(false)} className={styles.closeIcon}>&times;</button>
              </div>
              
              <div className={styles.modalBody}>
                {/* KOLOM KIRI: FORM */}
                <form onSubmit={handleCreate} className={styles.formLeft}>
                  <div className={styles.formGroup}>
                    <label>Nama Tempat</label>
                    <input 
                      required 
                      placeholder="Contoh: Merdeka Walk" 
                      value={formData.name} 
                      onChange={e=>setFormData({...formData, name:e.target.value})} 
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Kategori</label>
                    <select value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                      <option value="food">🍽️ Kuliner (Food)</option>
                      <option value="fun">🎡 Hiburan (Fun)</option>
                      <option value="hotels">🏨 Penginapan (Hotels)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Alamat Lengkap</label>
                    <input 
                      required 
                      placeholder="Jalan..." 
                      value={formData.address} 
                      onChange={e=>setFormData({...formData, address:e.target.value})} 
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Deskripsi</label>
                    <textarea 
                      required 
                      placeholder="Jelaskan tempat ini..." 
                      value={formData.description} 
                      onChange={e=>setFormData({...formData, description:e.target.value})} 
                    />
                  </div>

                  <div className={styles.coordGroup}>
                    <div>
                      <label>Lat</label>
                      <input value={formData.lat} readOnly placeholder="Klik Peta ->" />
                    </div>
                    <div>
                      <label>Lng</label>
                      <input value={formData.lng} readOnly placeholder="Klik Peta ->" />
                    </div>
                  </div>

                  <button type="submit" className={styles.saveBtn}>Simpan Data</button>
                </form>

                {/* KOLOM KANAN: PETA PICKER */}
                <div className={styles.mapRight}>
                  <p className={styles.mapHint}>👇 Klik di peta untuk mengisi Lat/Lng otomatis</p>
                  <LocationPicker 
                    initialPos={null}
                    onLocationSelect={(lat, lng) => setFormData({...formData, lat: lat.toString(), lng: lng.toString()})}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT LIST */}
        <div className={styles.content}>
          {loading ? <p>Loading...</p> : (
            <div className={styles.grid}>
              {items.map(item => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={`${styles.catTag} ${styles[item.category]}`}>{item.category}</span>
                    {activeTab === 'pending' && <span className={styles.pendingTag}>New</span>}
                  </div>
                  <h3>{item.name}</h3>
                  <p className={styles.desc}>{item.description}</p>
                  <small className={styles.meta}>📍 {item.address}</small>
                  <div className={styles.actions}>
                    {activeTab === 'pending' ? (
                      <>
                        <button onClick={() => handleApprove(item.id, item.category)} className={styles.approveBtn}>Approve</button>
                        <button onClick={() => handleReject(item.id)} className={styles.rejectBtn}>Reject</button>
                      </>
                    ) : (
                      <button onClick={() => handleDelete(item.id, item.name)} className={styles.deleteBtn}>Hapus</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
