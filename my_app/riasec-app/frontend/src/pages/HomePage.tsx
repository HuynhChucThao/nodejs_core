import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { occupationApi, savedJobsApi } from "../api/client";
import { CareerCard } from "../components/common/CareerCard";
import { RiasecBadge } from "../components/common/RiasecBadge";
import { useAuth } from "../context/AuthContext";
import { Occupation, RIASEC_MAP, RiasecKey } from "../types";

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
  onSelectOccupation: (occ: Occupation) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectOccupation,
}) => {
  const { user, openAuthModal } = useAuth();
  const [popularOccupations, setPopularOccupations] = useState<Occupation[]>(
    [],
  );
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await occupationApi.getAll({ limit: 6 });
        setPopularOccupations(res.items || res.data || []);

        if (user) {
          const saved = await savedJobsApi.getSaved().catch(() => []);
          setSavedJobIds(new Set(saved.map((j) => j.occupation.id)));
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
        if (res.isSaved) {
          next.add(occ.id);
        } else {
          next.delete(occ.id);
        }
        return next;
      });
    } catch (err) {
      console.error("Error saving career:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Welcome Hero Card (Matching fragment_home.xml cardWelcome) */}
      <div className="card-welcome">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#E0F2FE",
            color: "#0369A1",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          <Sparkles size={14} /> INTERNATIONAL RIASEC CAREER MODEL
        </div>

        <h2
          style={{
            fontSize: "1.45rem",
            fontWeight: 800,
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
            lineHeight: 1.3,
            marginBottom: 8,
          }}
        >
          Welcome to RIASEC Career Test
        </h2>

        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          Discover your potential, identify your dominant personality traits, and
          find the best career paths tailored for your future.
        </p>

        <button className="btn-primary" onClick={() => onNavigate("pre-test")}>
          <span>Start Assessment Now</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* 2. RIASEC 6 Personality Types Quick Overview */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              fontFamily: "var(--font-heading)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BookOpen size={18} color="var(--primary-teal)" />
            6 RIASEC Personality Types
          </h3>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--primary-teal)",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => onNavigate("explore")}
          >
            Explore &rarr;
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          {(Object.keys(RIASEC_MAP) as RiasecKey[]).map((key) => {
            const item = RIASEC_MAP[key];
            return (
              <div
                key={key}
                onClick={() => onNavigate("explore", { mainCode: key })}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: "12px 14px",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = item.color)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-color)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <RiasecBadge code={key} size="md" />
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {item.nameEn}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.nameEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recommended & Popular Careers Section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              fontFamily: "var(--font-heading)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TrendingUp size={18} color="var(--primary-teal)" />
            Featured & Recommended Careers
          </h3>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--primary-teal)",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => onNavigate("explore")}
          >
            View all
          </span>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px 0",
              color: "var(--text-muted)",
              fontSize: "0.88rem",
            }}
          >
            Loading career data...
          </div>
        ) : popularOccupations.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {popularOccupations.map((occ) => (
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
              background: "white",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              border: "1px dashed var(--border-color)",
            }}
          >
            <Compass
              size={32}
              color="var(--text-muted)"
              style={{ margin: "0 auto 10px" }}
            />
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              Take the RIASEC personality assessment to receive personalized
              career recommendations tailored just for you!
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: 14, width: "auto", display: "inline-flex" }}
              onClick={() => onNavigate("pre-test")}
            >
              Start Assessment Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
