import React from 'react';
import { RIASEC_MAP, RiasecKey } from '../../types';

interface RiasecBadgeProps {
  code: string; // can be "R", "RIA", "SEC", etc.
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
}

export const RiasecBadge: React.FC<RiasecBadgeProps> = ({ code, size = 'sm', showFullName = false }) => {
  if (!code) return null;
  const mainLetter = (code[0]?.toUpperCase() || 'R') as RiasecKey;
  const info = RIASEC_MAP[mainLetter] || RIASEC_MAP.R;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={`riasec-badge badge-${mainLetter.toLowerCase()} ${sizeClasses[size]}`}
      title={`${info.nameEn}`}
    >
      {code}
      {showFullName && <span style={{ marginLeft: 4, fontWeight: 500 }}>• {info.nameEn}</span>}
    </span>
  );
};
