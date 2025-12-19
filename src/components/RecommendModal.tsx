import React, { useState } from 'react';
import styles from './RecommendModal.module.css';

interface Props {
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; lat: number; lng: number }) => void;
}

export default function RecommendModal({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!name.trim() || !description.trim() || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      alert('Please fill in all fields with valid coordinates');
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim(), lat: parsedLat, lng: parsedLng });
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>Tambah Rekomendasi</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Nama Tempat
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Deskripsi Singkat
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
          <div className={styles.row}>
            <label>
              Latitude
              <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. -6.200000" />
            </label>
            <label>
              Longitude
              <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g. 106.816666" />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.ghost} onClick={onClose}>Batal</button>
            <button type="submit" className={styles.primary}>Kirim</button>
          </div>
        </form>
      </div>
    </div>
  );
}
