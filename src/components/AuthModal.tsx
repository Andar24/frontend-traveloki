// src/components/AuthModal.tsx
import { useState } from 'react';
import { api } from '../services/api';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

export const AuthModal = ({ onClose, onLoginSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true); // Toggle Login vs Register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.login(email, password);
      } else {
        res = await api.register(username, email, password, fullName);
      }

      if (res.status === 'success') {
        onLoginSuccess(res.data.user, res.data.token);
        onClose();
        alert(isLogin ? "Login Berhasil!" : "Registrasi Berhasil!");
      } else {
        setError(res.message || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <h2>{isLogin ? 'Masuk ke Traveloki' : 'Daftar Akun Baru'}</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Nama Lengkap" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                required 
              />
            </>
          )}
          
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Loading...' : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <p className={styles.switchText}>
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Daftar di sini' : 'Login di sini'}
          </span>
        </p>
      </div>
    </div>
  );
};