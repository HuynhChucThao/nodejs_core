import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Check,
  Edit2,
  Heart,
  LogIn,
  LogOut,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  User as UserIcon,
} from 'lucide-react';
import { authApi, feedbackApi, savedJobsApi } from '../api/client';
import { CareerCard } from '../components/common/CareerCard';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { Occupation } from '../types';

interface ProfilePageProps {
  onSelectOccupation: (occ: Occupation) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSelectOccupation }) => {
  const { user, logout, openAuthModal, refreshUser } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Occupation[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);

  // Dream job edit state
  const [isEditingDream, setIsEditingDream] = useState(false);
  const [dreamInput, setDreamInput] = useState(user?.dreamWork || '');
  const [savingDream, setSavingDream] = useState(false);

  // Feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDreamInput(user.dreamWork || '');
      const loadSaved = async () => {
        setLoadingJobs(true);
        try {
          const list = await savedJobsApi.getSaved();
          setSavedJobs(list.map((l)=> l.occupation) || []);
        } catch (err) {
          console.error('Error loading saved careers:', err);
        } finally {
          setLoadingJobs(false);
        }
      };
      loadSaved();
    }
  }, [user]);

  const handleSaveDreamWork = async () => {
    if (!user) return;
    setSavingDream(true);
    try {
      await authApi.updateProfile({ dreamWork: dreamInput });
      await refreshUser();
      setIsEditingDream(false);
    } catch (err) {
      console.error('Error updating dream career:', err);
    } finally {
      setSavingDream(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;
    setSubmittingFeedback(true);
    try {
      await feedbackApi.submit(feedbackContent, feedbackRating);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setShowFeedbackModal(false);
        setFeedbackContent('');
      }, 1500);
    } catch (err) {
      console.error('Error sending feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleToggleSave = async (occ: Occupation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await savedJobsApi.toggleSave(occ.id);
      setSavedJobs((prev) => prev.filter((j) => j.id !== occ.id));
    } catch (err) {
      console.error('Error removing saved career:', err);
    }
  };

  if (!user) {
    return (
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '40px 20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--primary-teal-glow)',
            color: 'var(--primary-teal)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <UserIcon size={26} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Your Profile
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 320, margin: '8px auto 20px' }}>
          Sign in to view your profile, update your dream career, and manage your saved career bookmarks.
        </p>
        <button
          className="btn-primary"
          style={{ width: 'auto', display: 'inline-flex' }}
          onClick={openAuthModal}
        >
          <LogIn size={16} />
          <span>Sign In or Register</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Profile Overview Card */}
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 22,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-teal), var(--primary-blue))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            boxShadow: 'var(--shadow-teal)',
            flexShrink: 0,
          }}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {user.name || 'RIASEC Learner'}
            </h2>
            {user.role === 'ADMIN' && (
              <span
                style={{
                  background: '#FEF3C7',
                  color: '#B45309',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Shield size={10} /> ADMIN
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {user.email}
          </p>
        </div>
      </div>

      {/* 2. Dream Work Card */}
      <div
        style={{
          background: 'white',
          borderRadius: 18,
          padding: 18,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color="var(--primary-teal)" /> Your Dream Career:
          </span>
          {!isEditingDream && (
            <button
              onClick={() => setIsEditingDream(true)}
              style={{ fontSize: '0.78rem', color: 'var(--primary-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Edit2 size={12} /> Edit
            </button>
          )}
        </div>

        {isEditingDream ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="search-input"
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              placeholder="e.g. Software Engineer, Doctor..."
              style={{ border: '1px solid var(--primary-teal)', borderRadius: 10, padding: '8px 12px' }}
            />
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '0.82rem' }}
              onClick={handleSaveDreamWork}
              disabled={savingDream}
            >
              <Check size={14} /> Save
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {user.dreamWork || 'Not set yet'}
          </div>
        )}
      </div>

      {/* 3. Saved Occupations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bookmark size={18} color="var(--primary-teal)" /> Saved Careers ({savedJobs.length})
          </h3>
        </div>

        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
            Loading saved careers...
          </div>
        ) : savedJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {savedJobs.map((occ) => (
              <CareerCard
                key={occ.id}
                occupation={occ}
                onClick={onSelectOccupation}
                onToggleSave={handleToggleSave}
                isSaved={true}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              border: '1px dashed var(--border-color)',
            }}
          >
            <Bookmark size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              You haven't saved any careers yet. Explore careers and click the Bookmark icon to save those you like!
            </p>
          </div>
        )}
      </div>

      {/* 4. Feedback & Support Dialog Trigger */}
      <div
        style={{
          background: 'white',
          borderRadius: 18,
          padding: 16,
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setShowFeedbackModal(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Send Feedback</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Help us improve the career guidance experience
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 700 }}>&rarr;</span>
      </div>

      {/* 5. Logout Button */}
      <button
        className="btn-secondary"
        onClick={logout}
        style={{
          color: '#EF4444',
          borderColor: '#FCA5A5',
          background: '#FEF2F2',
          padding: '14px',
          fontWeight: 700,
        }}
      >
        <LogOut size={16} /> Log Out
      </button>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Send Feedback"
      >
        {feedbackSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#059669' }}>
            <Heart size={40} style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Thank you for your feedback!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Your thoughts help us continuously enhance the platform.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Satisfaction Rating:
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    style={{ color: star <= feedbackRating ? '#F59E0B' : '#CBD5E1', padding: 4 }}
                  >
                    <Star size={30} fill={star <= feedbackRating ? '#F59E0B' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Your Feedback:
              </label>
              <textarea
                rows={4}
                className="search-input"
                style={{
                  width: '100%',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 12,
                  resize: 'none',
                }}
                placeholder="Share your thoughts or suggest improvements..."
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submittingFeedback || !feedbackContent.trim()}
            >
              {submittingFeedback ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
