import React from 'react';
import { Bookmark, Eye, GraduationCap } from 'lucide-react';
import { Occupation } from '../../types';
import { RiasecBadge } from './RiasecBadge';

interface CareerCardProps {
  occupation: Occupation;
  onClick: (occ: Occupation) => void;
  onToggleSave?: (occ: Occupation, e: React.MouseEvent) => void;
  isSaved?: boolean;
}

export const CareerCard: React.FC<CareerCardProps> = ({
  occupation,
  onClick,
  onToggleSave,
  isSaved = false,
}) => {
  return (
    <div className="career-card" onClick={() => onClick(occupation)}>
      <div className="career-header">
        <div>
          <h3 className="career-title">{occupation.jobName}</h3>
          <div className="career-badges" style={{ marginTop: 6 }}>
            <RiasecBadge code={occupation.riasecCode || occupation.mainCode} />
            {occupation.education && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <GraduationCap size={13} />
                {occupation.education.length > 28
                  ? `${occupation.education.substring(0, 28)}...`
                  : occupation.education}
              </span>
            )}
          </div>
        </div>

        {onToggleSave && (
          <button
            className="btn-icon"
            style={{
              color: isSaved ? '#E11D48' : 'var(--text-muted)',
              borderColor: isSaved ? '#FECDD3' : 'var(--border-color)',
              background: isSaved ? '#FFF1F2' : 'var(--bg-subtle)',
            }}
            onClick={(e) => onToggleSave(occupation, e)}
            title={isSaved ? 'Saved' : 'Save career'}
          >
            <Bookmark size={17} fill={isSaved ? '#E11D48' : 'none'} />
          </button>
        )}
      </div>

      {occupation.description && (
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.45,
          }}
        >
          {occupation.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          paddingTop: 8,
          borderTop: '1px dashed var(--border-color-light)',
          marginTop: 4,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Eye size={13} /> {occupation.viewCount || 0} views
        </span>
        <span style={{ color: 'var(--primary-teal)', fontWeight: 600 }}>View details &rarr;</span>
      </div>
    </div>
  );
};
