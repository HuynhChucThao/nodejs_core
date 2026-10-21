import React from 'react';
import {
  Bot,
  Compass,
  FileQuestion,
  History,
  Home,
  LogIn,
  Sparkles,
  // User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, onSelectTab }) => {
  const { user, openAuthModal } = useAuth();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div className="header-brand" onClick={() => onSelectTab('home')}>
          <div className="header-logo-badge">AiRa</div>
          <div className="header-title-group">
            <h1>RIASEC Career AI</h1>
            <span>Smart Career Guidance & Assessment Platform</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <button
            className={`desktop-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => onSelectTab('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          <button
            className={`desktop-nav-item ${activeTab === 'explore' || activeTab === 'occupation-detail' ? 'active' : ''}`}
            onClick={() => onSelectTab('explore')}
          >
            <Compass size={18} />
            <span>Explore Careers</span>
          </button>

          <button
            className={`desktop-nav-item ${activeTab === 'pre-test' || activeTab === 'test' || activeTab === 'result' ? 'active' : ''}`}
            onClick={() => onSelectTab('pre-test')}
          >
            <FileQuestion size={18} />
            <span>RIASEC Assessment</span>
          </button>

          <button
            className={`desktop-nav-item ai-nav-item ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => onSelectTab('ai')}
          >
            <Bot size={18} />
            <span>AI Advisor</span>
            <Sparkles size={14} />
          </button>

          <button
            className={`desktop-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => onSelectTab('history')}
          >
            <History size={18} />
            <span>History</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          {user ? (
            <button
              className={`desktop-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              style={{
                border: '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: 12,
                background: 'white',
              }}
              onClick={() => onSelectTab('profile')}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--primary-teal-glow)',
                  color: 'var(--primary-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 700 }}>{user.name || user.email.split('@')[0]}</span>
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              onClick={openAuthModal}
            >
              <LogIn size={16} />
              <span>Log In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
