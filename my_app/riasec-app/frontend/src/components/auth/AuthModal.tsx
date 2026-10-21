import React, { useState } from 'react';
import { Lock, Mail, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dreamWork, setDreamWork] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name, dreamWork);
      }
      setEmail('');
      setPassword('');
      setName('');
      setDreamWork('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} maxWidth="420px">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'var(--primary-teal-glow)',
            color: 'var(--primary-teal)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <Sparkles size={24} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          {tab === 'login' ? 'Welcome Back' : 'Create RIASEC Account'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {tab === 'login'
            ? 'Sign in to save test results and favorite careers'
            : 'Discover career potential tailored to your personality'}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-subtle)',
          padding: 4,
          borderRadius: 12,
          marginBottom: 18,
          border: '1px solid var(--border-color)',
        }}
      >
        <button
          type="button"
          onClick={() => { setTab('login'); setError(null); }}
          style={{
            flex: 1,
            padding: '8px 0',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderRadius: 8,
            background: tab === 'login' ? 'white' : 'transparent',
            color: tab === 'login' ? 'var(--primary-teal)' : 'var(--text-secondary)',
            boxShadow: tab === 'login' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => { setTab('register'); setError(null); }}
          style={{
            flex: 1,
            padding: '8px 0',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderRadius: 8,
            background: tab === 'register' ? 'white' : 'transparent',
            color: tab === 'register' ? 'var(--primary-teal)' : 'var(--text-secondary)',
            boxShadow: tab === 'register' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          Register
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            background: '#FEE2E2',
            color: '#B91C1C',
            borderRadius: 8,
            fontSize: '0.82rem',
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'register' && (
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Full Name
            </label>
            <div className="search-wrapper">
              <UserIcon size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="search-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            Email
          </label>
          <div className="search-wrapper">
            <Mail size={16} color="var(--text-muted)" />
            <input
              type="email"
              className="search-input"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
            Password
          </label>
          <div className="search-wrapper">
            <Lock size={16} color="var(--text-muted)" />
            <input
              type="password"
              className="search-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {tab === 'register' && (
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Dream Career (optional)
            </label>
            <div className="search-wrapper">
              <Sparkles size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="search-input"
                placeholder="Software Engineer, Doctor, Designer..."
                value={dreamWork}
                onChange={(e) => setDreamWork(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: 8 }}
          disabled={loading}
        >
          {loading ? 'Processing...' : tab === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </form>
    </Modal>
  );
};
