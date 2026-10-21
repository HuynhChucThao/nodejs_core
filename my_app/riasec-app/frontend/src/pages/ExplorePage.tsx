import React, { useEffect, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { occupationApi, savedJobsApi } from '../api/client';
import { CareerCard } from '../components/common/CareerCard';
import { useAuth } from '../context/AuthContext';
import { Occupation, RIASEC_MAP, RiasecKey } from '../types';

interface ExplorePageProps {
  initialCategory?: string;
  onSelectOccupation: (occ: Occupation) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialCategory,
  onSelectOccupation,
}) => {
  const { user, openAuthModal } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>(initialCategory || 'ALL');
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: { keyword?: string; mainCode?: string; limit: number } = { limit: 50 };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCode !== 'ALL') params.mainCode = selectedCode;

      const res = await occupationApi.getAll(params);
      setOccupations(res.items || res.data || []);
      setTotal(res.total || 0);

      if (user) {
        const saved = await savedJobsApi.getSaved().catch(() => []);
        setSavedJobIds(new Set(saved.map((j) => j.occupation.id)));
      }
    } catch (err) {
      console.error('Error loading occupations list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCode, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (occ: Occupation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await savedJobsApi.toggleSave(occ.id);
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (res.isSaved) next.add(occ.id);
        else next.delete(occ.id);
        return next;
      });
    } catch (err) {
      console.error('Error saving career:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 1. Header Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Explore Careers
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
          Search and filter career opportunities by the RIASEC personality model
        </p>
      </div>

      {/* 2. Search Bar Form */}
      <form onSubmit={handleSearchSubmit}>
        <div className="search-wrapper">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search careers, keywords, skills..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                fetchJobs();
              }}
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* 3. Category Filter Chips (R, I, A, S, E, C) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          <Filter size={14} /> Filter by RIASEC Type:
        </div>

        <div className="chip-container">
          <button
            className={`filter-chip ${selectedCode === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCode('ALL')}
          >
            All
          </button>
          {(Object.keys(RIASEC_MAP) as RiasecKey[]).map((key) => {
            const info = RIASEC_MAP[key];
            const isActive = selectedCode === key;
            return (
              <button
                key={key}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                style={{
                  borderColor: isActive ? info.color : 'var(--border-color)',
                  color: isActive ? info.color : 'var(--text-secondary)',
                  backgroundColor: isActive ? info.bgColor : 'white',
                }}
                onClick={() => setSelectedCode(key)}
              >
                <span>{key}</span> • <span>{info.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Results Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Found {total} matching careers
          </span>
          {selectedCode !== 'ALL' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-teal)', fontWeight: 600 }}>
              Filtering by: {RIASEC_MAP[selectedCode as RiasecKey]?.nameEn}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Searching careers...
          </div>
        ) : occupations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {occupations.map((occ) => (
              <CareerCard
                key={occ.id}
                occupation={occ}
                onClick={onSelectOccupation}
                onToggleSave={handleToggleSave}
                isSaved={savedJobIds.has(occ.id)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '36px 20px',
              textAlign: 'center',
              border: '1px dashed var(--border-color)',
            }}
          >
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No careers found matching "{keyword}"
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              Try searching with different keywords or reset the filter to view all careers.
            </p>
            <button
              className="btn-secondary"
              style={{ marginTop: 16 }}
              onClick={() => {
                setKeyword('');
                setSelectedCode('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
