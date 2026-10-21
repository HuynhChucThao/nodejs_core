import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Bot,
  CheckCircle2,
  Eye,
  GraduationCap,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { occupationApi, savedJobsApi } from '../api/client';
import { RiasecBadge } from '../components/common/RiasecBadge';
import { useAuth } from '../context/AuthContext';
import { Occupation, RIASEC_MAP, RiasecKey } from '../types';

interface OccupationDetailPageProps {
  occupation: Occupation;
  onBack: () => void;
  onAskAi: (jobName: string, riasecCode: string) => void;
}

export const OccupationDetailPage: React.FC<OccupationDetailPageProps> = ({
  occupation: initialOccupation,
  onBack,
  onAskAi,
}) => {
  const { user, openAuthModal } = useAuth();
  const [occupation, setOccupation] = useState<Occupation>(initialOccupation);
  const [isSaved, setIsSaved] = useState<boolean>(!!initialOccupation.isSaved);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchFreshDetail = async () => {
      try {
        const detail = await occupationApi.getById(initialOccupation.id);
        setOccupation(detail);
        if (user) {
          const savedList = await savedJobsApi.getSaved().catch(() => []);
          setIsSaved(savedList.some((j) => j.occupation.id === detail.id));
        }
      } catch (err) {
        console.error('Error loading career details:', err);
      }
    };
    fetchFreshDetail();
  }, [initialOccupation.id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setSaving(true);
    try {
      const res = await savedJobsApi.toggleSave(occupation.id);
      setIsSaved(res.isSaved);
    } catch (err) {
      console.error('Error saving career:', err);
    } finally {
      setSaving(false);
    }
  };

  // Parse pipe separated tasks and skills
  const tasks = occupation.taskRaw
    ? occupation.taskRaw.split('|').map((t) => t.trim()).filter(Boolean)
    : [];

  const skills = occupation.skillsRaw
    ? occupation.skillsRaw.split('|').map((s) => s.trim()).filter(Boolean)
    : [];

  const mainRiasecInfo = RIASEC_MAP[occupation.mainCode as RiasecKey] || RIASEC_MAP.R;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="btn-secondary"
          onClick={onBack}
          style={{ padding: '8px 14px', borderRadius: 20, fontSize: '0.82rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          className="btn-secondary"
          onClick={handleToggleSave}
          disabled={saving}
          style={{
            padding: '8px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            color: isSaved ? '#E11D48' : 'var(--text-secondary)',
            borderColor: isSaved ? '#FECDD3' : 'var(--border-color)',
            background: isSaved ? '#FFF1F2' : 'white',
          }}
        >
          <Bookmark size={16} fill={isSaved ? '#E11D48' : 'none'} />
          <span>{isSaved ? 'Saved' : 'Save Career'}</span>
        </button>
      </div>

      {/* Main Title Banner */}
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <RiasecBadge code={occupation.riasecCode || occupation.mainCode} size="lg" showFullName />
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            marginBottom: 10,
          }}
        >
          {occupation.jobName}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Eye size={14} /> {occupation.viewCount || 0} views
          </span>
          <span>•</span>
          <span style={{ color: mainRiasecInfo.color, fontWeight: 600 }}>
            Dominant Personality Type: {mainRiasecInfo.nameEn}
          </span>
        </div>
      </div>

      {/* Overview Section */}
      {occupation.description && (
        <div
          style={{
            background: 'white',
            borderRadius: 18,
            padding: 20,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              marginBottom: 10,
              color: 'var(--text-primary)',
            }}
          >
            Career Overview
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {occupation.description}
          </p>
        </div>
      )}

      {/* Education Needed Section */}
      {occupation.education && (
        <div
          style={{
            background: 'white',
            borderRadius: 18,
            padding: 20,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              marginBottom: 10,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <GraduationCap size={18} color="var(--primary-teal)" />
            Recommended Education
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {occupation.education}
          </p>
        </div>
      )}

      {/* Key Responsibilities Section */}
      {tasks.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: 18,
            padding: 20,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              marginBottom: 12,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ListChecks size={18} color="var(--primary-blue)" />
            Key Tasks & Responsibilities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map((task, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                }}
              >
                <CheckCircle2 size={16} color="var(--primary-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Skills Section */}
      {skills.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: 18,
            padding: 20,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              marginBottom: 12,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={18} color="#D97706" />
            Top Required Skills
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 10,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Floating Action: Ask AI about this occupation */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          borderRadius: 20,
          padding: 20,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={20} color="#38BDF8" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Want to explore further?</h4>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Ask the AI Advisor about learning pathways, market trends, and salary ranges for this career.
            </p>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #0284C7, #0EA5E9)' }}
          onClick={() => onAskAi(occupation.jobName, occupation.riasecCode || occupation.mainCode)}
        >
          <Bot size={18} />
          <span>Ask AI Advisor About This Career</span>
        </button>
      </div>
    </div>
  );
};
