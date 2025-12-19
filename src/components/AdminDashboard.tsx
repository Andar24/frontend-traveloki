import { useEffect, useState } from 'react';
import { api } from '../services/api';
import styles from './AdminDashboard.module.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon marker leaflet
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

// Komponen Helper untuk Update Posisi Peta saat Form Berubah
const MapUpdater = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15); // Terbang ke lokasi baru dengan zoom 15
    }
  }, [center, map]);
  return null;
};

// Komponen Peta Picker
const LocationPicker = ({ 
  onLocationSelect, 
  selectedPos 
}: { 
  onLocationSelect: (lat: number, lng: number) => void, 
  selectedPos: { lat: number, lng: number } | null 
}) => {
  
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  // Default center (Medan) jika belum ada pilihan
  const centerPos: [number, number] = selectedPos 
    ? [selectedPos.lat, selectedPos.lng] 
    : [3.5952, 98.6722];

  return (
    <MapContainer 
      center={centerPos} 
      zoom={13} 
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapEvents />
      <MapUpdater center={selectedPos ? [selectedPos.lat, selectedPos.lng] : null} />
      {selectedPos && <Marker position={[selectedPos.lat, selectedPos.lng]} />}
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
  const [gettingLoc, setGettingLoc] = useState(false); // State loading lokasi

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

  // FITUR BARU: Ambil Lokasi Saat Ini
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }

    setGettingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude.toString(),
          lng: longitude.toString()
        }));
        setGettingLoc(false);
      },
      (error) => {
        alert("Gagal mengambil lokasi: " + error.message);
        setGettingLoc(false);
      }
    );
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

  // Helper untuk parsing Lat/Lng ke object number
  const getSelectedPos = () => {
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    return (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <h1>🛡️ Admin Control Center</h1>
        </div>
        <button onClick={onLogout} className={styles.logoutBtn}>Logout</button>
      </div>

      <div className={styles.main}>
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

        {activeTab === 'active' && (
          <button className={styles.addBtn} onClick={() => setShowAddForm(true)}>
            + Tambah Tempat Baru
          </button>
        )}

        {/* --- MODAL TAMBAH --- */}
        {showAddForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>📍 Tambah Destinasi Baru</h2>
                <button onClick={() => setShowAddForm(false)} className={styles.closeIcon}>&times;</button>
              </div>
              
              <div className={styles.modalBody}>
                {/* FORM */}
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

                  {/* UPDATE BAGIAN KOORDINAT */}
                  <div className={styles.coordSection}>
                    <div className={styles.coordInputs}>
                      <div>
                        <label>Lat</label>
                        <input value={formData.lat} readOnly placeholder="0.00" />
                      </div>
                      <div>
                        <label>Lng</label>
                        <input value={formData.lng} readOnly placeholder="0.00" />
                      </div>
                    </div>
                    
                    {/* TOMBOL LOKASI SAYA */}
                    <button 
                      type="button" 
                      className={styles.locBtn}
                      onClick={handleGetCurrentLocation}
                      disabled={gettingLoc}
                    >
                      {gettingLoc ? 'Mencari...' : '📍 Gunakan Lokasi Saya'}
                    </button>
                  </div>

                  <button type="submit" className={styles.saveBtn}>Simpan Data</button>
                </form>

                {/* PETA */}
                <div className={styles.mapRight}>
                  <p className={styles.mapHint}>👇 Klik di peta ATAU gunakan tombol lokasi</p>
                  <LocationPicker 
                    selectedPos={getSelectedPos()}
                    onLocationSelect={(lat, lng) => setFormData({...formData, lat: lat.toString(), lng: lng.toString()})}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
